const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const archiver = require('archiver');
const dataService = require('./dataService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true
}));

app.use(express.json());

const publicDir = path.join(__dirname, '../frontend');
const uploadDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

[publicDir, uploadDir, dataDir].forEach(dir => {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Auth middleware
const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ error: 'Authentication required' });
        req.user = jwt.verify(token, 'your-secret-key');
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

app.use(express.static(publicDir));

const TEACHER_REGISTRATION_CODE = 'TEACHER123';

// ============ AUTH ============

app.post('/register', async (req, res) => {
    try {
        const { name, username, role, password, teacherCode } = req.body;
        if (!name || !username || !role || !password) return res.status(400).json({ error: "All fields are required" });
        if (role === 'teacher') {
            if (!teacherCode) return res.status(400).json({ error: "Teacher registration code is required" });
            if (teacherCode !== TEACHER_REGISTRATION_CODE) return res.status(403).json({ error: "Invalid teacher registration code" });
        }
        const user = await dataService.registerUser(name, username, role, password);
        res.json({ message: 'Registration successful', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
        const user = await dataService.loginUser(username, password);
        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, 'your-secret-key', { expiresIn: '24h' });
        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// ============ CLASSES ============

// Create class (teacher) — with optional password
app.post('/classes', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can create classes' });
        const { courseCode, password } = req.body;
        if (!courseCode || !courseCode.trim()) return res.status(400).json({ error: 'Course code is required' });
        const result = dataService.createClass(req.user.userId, courseCode, password || '');
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Join class (student) — with password validation
app.post('/classes/join', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can join classes' });
        const { courseCode, password } = req.body;
        if (!courseCode || !courseCode.trim()) return res.status(400).json({ error: 'Course code is required' });
        const result = dataService.joinClass(req.user.userId, courseCode, password || '');
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's classes
app.get('/classes', authenticate, (req, res) => {
    try {
        const classes = dataService.getUserClasses(req.user.userId);
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get class password (teacher only)
app.get('/classes/:code/password', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can view class passwords' });
        const pw = dataService.getClassPassword(decodeURIComponent(req.params.code), req.user.userId);
        res.json({ password: pw });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update class password (teacher only)
app.put('/classes/:code/password', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can change passwords' });
        const result = dataService.updateClassPassword(decodeURIComponent(req.params.code), req.user.userId, req.body.password || '');
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============ ASSIGNMENTS ============

// Get assignments for a class
app.get('/classes/:code/assignments', authenticate, (req, res) => {
    try {
        const courseCode = decodeURIComponent(req.params.code);
        const assignments = dataService.getClassAssignments(courseCode);

        // For each assignment, get submission count + IP sharing info
        const withMeta = assignments.map(a => {
            const submissions = dataService.getAssignmentSubmissions(a.id);
            // Detect IP sharing
            const ipMap = {};
            submissions.forEach(s => {
                if (s.ip_address) {
                    if (!ipMap[s.ip_address]) ipMap[s.ip_address] = [];
                    ipMap[s.ip_address].push(s.uploader_name);
                }
            });
            const sharedIps = Object.entries(ipMap).filter(([ip, names]) => names.length > 1);
            return { ...a, submission_count: submissions.length, ip_sharing: sharedIps.length > 0, shared_ips: sharedIps };
        });

        res.json(withMeta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get submissions for an assignment
app.get('/assignments/:id/submissions', authenticate, (req, res) => {
    try {
        const submissions = dataService.getAssignmentSubmissions(req.params.id);
        // Add IP sharing flags
        const ipMap = {};
        submissions.forEach(s => {
            if (s.ip_address) {
                if (!ipMap[s.ip_address]) ipMap[s.ip_address] = [];
                ipMap[s.ip_address].push(s.user_id);
            }
        });
        const sharedIpUsers = new Set();
        Object.values(ipMap).filter(arr => arr.length > 1).forEach(arr => arr.forEach(id => sharedIpUsers.add(id)));
        const flagged = submissions.map(s => ({ ...s, ip_flagged: sharedIpUsers.has(s.user_id) }));
        res.json(flagged);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Set/update assignment deadline
app.put('/assignments/:id/deadline', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can set deadlines' });
        const result = dataService.setAssignmentDeadline(req.params.id, req.user.userId, req.body.deadline || null);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Set/update assignment password
app.put('/assignments/:id/password', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can set assignment passwords' });
        const result = dataService.setAssignmentPassword(req.params.id, req.user.userId, req.body.password || '');
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Check if assignment has a password (for students)
app.get('/assignments/:id/check-password', authenticate, (req, res) => {
    try {
        const assignment = dataService.getAssignmentById(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        const hasPassword = !!(assignment.assignment_password && assignment.assignment_password.trim());
        const hasSubmitted = dataService.hasStudentSubmitted(req.user.userId, req.params.id);
        res.json({ hasPassword, hasSubmitted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Validate assignment password
app.post('/assignments/:id/validate-password', authenticate, (req, res) => {
    try {
        const assignment = dataService.getAssignmentById(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        if (!assignment.assignment_password || !assignment.assignment_password.trim()) {
            return res.json({ valid: true });
        }
        if (req.body.password === assignment.assignment_password) {
            return res.json({ valid: true });
        }
        return res.status(403).json({ error: 'Incorrect assignment password' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student submissions
app.get('/submissions', authenticate, (req, res) => {
    try {
        const submissions = dataService.getUserSubmissions(req.user.userId);
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ FILES ============

// Upload
app.post('/upload', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const userId = req.user.userId;
        const filename = req.file.originalname;
        const savedName = req.file.filename;
        const courseCode = req.body.courseCode;
        const assignmentFileId = req.body.assignmentFileId || null;
        const deadline = req.body.deadline || null;
        const assignmentPassword = req.body.assignmentPassword || '';
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

        if (!courseCode) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Course code is required" });
        }

        const user = dataService.getUserById(userId);
        if (!user) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "User not found" });
        }

        const userCourseCodes = (user.course_codes || '').split(',').map(c => c.trim());
        if (!userCourseCodes.includes(courseCode)) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(403).json({ error: "You can only upload to your registered courses" });
        }

        // If student uploading to assignment, check assignment password
        if (assignmentFileId && user.role === 'student') {
            const assignment = dataService.getAssignmentById(assignmentFileId);
            if (assignment && assignment.assignment_password && assignment.assignment_password.trim()) {
                const submittedPw = req.body.submissionPassword || '';
                if (submittedPw !== assignment.assignment_password) {
                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                    return res.status(403).json({ error: "Incorrect assignment password" });
                }
            }
        }

        const file = dataService.addFile(filename, userId, savedName, courseCode, ipAddress,
            assignmentFileId ? parseInt(assignmentFileId) : null, deadline, assignmentPassword);

        res.json({ message: 'File uploaded successfully', file: { ...file, savedName } });
    } catch (error) {
        console.error('Upload error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

// Get files
app.get('/files', authenticate, (req, res) => {
    try {
        const files = dataService.getFiles(req.user.userId, req.user.role);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download single file
app.get('/download/:filename', authenticate, async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

        const files = await dataService.getFiles(req.user.userId, req.user.role);
        const file = files.find(f => f.saved_name === filename);
        if (!file) return res.status(404).json({ error: 'File not found' });

        // Check assignment password for students downloading teacher files
        if (req.user.role === 'student' && file.uploader_role === 'teacher' && file.assignment_password && file.assignment_password.trim()) {
            // Check if student has already submitted
            const hasSubmitted = dataService.hasStudentSubmitted(req.user.userId, file.id);
            if (!hasSubmitted) {
                // Need password from query param
                const pw = req.query.assignmentPassword || '';
                if (pw !== file.assignment_password) {
                    return res.status(403).json({ error: 'Assignment password required to download', needsPassword: true });
                }
            }
        }

        const originalName = file.filename;
        const fileExt = path.extname(originalName);
        const fileNameWithoutExt = path.basename(originalName, fileExt);
        const downloadName = `${fileNameWithoutExt}_${file.course_code}${fileExt}`;

        res.download(filePath, downloadName, (err) => { if (err) console.error('Error sending file:', err); });
    } catch (error) {
        res.status(500).json({ error: 'Error downloading file' });
    }
});

// ZIP download — all submissions for one assignment
app.get('/assignments/:id/submissions/zip', authenticate, async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const assignment = dataService.getAssignmentById(assignmentId);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        const submissions = dataService.getAssignmentSubmissions(assignmentId);
        if (!submissions.length) return res.status(404).json({ error: 'No submissions found' });

        // Verify all files exist
        for (const s of submissions) {
            if (!fs.existsSync(path.join(uploadDir, s.saved_name))) {
                return res.status(404).json({ error: `File missing: ${s.filename}` });
            }
        }

        const assignmentName = assignment.filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const dateStr = new Date().toISOString().split('T')[0];
        const zipName = `${assignmentName}_submissions_${dateStr}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', err => { throw err; });
        archive.pipe(res);

        // Structure: StudentName/filename
        submissions.forEach(s => {
            const studentFolder = (s.uploader_name || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
            archive.file(path.join(uploadDir, s.saved_name), { name: `${studentFolder}/${s.filename}` });
        });

        await archive.finalize();
    } catch (error) {
        console.error('ZIP error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Error creating zip' });
    }
});

// ZIP download — all submissions for a class (structured by assignment)
app.get('/classes/:code/submissions/zip', authenticate, async (req, res) => {
    try {
        const courseCode = decodeURIComponent(req.params.code);
        const submissions = dataService.getClassSubmissions(courseCode);
        if (!submissions.length) return res.status(404).json({ error: 'No submissions found' });

        const dateStr = new Date().toISOString().split('T')[0];
        const zipName = `${courseCode}_all_submissions_${dateStr}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', err => { throw err; });
        archive.pipe(res);

        // Structure: AssignmentName/StudentName/files
        submissions.forEach(s => {
            const assignmentFolder = (s.assignment_name || 'unlinked').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
            const studentFolder = (s.uploader_name || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
            const filePath = path.join(uploadDir, s.saved_name);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: `${assignmentFolder}/${studentFolder}/${s.filename}` });
            }
        });

        await archive.finalize();
    } catch (error) {
        console.error('ZIP error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Error creating zip' });
    }
});

// Legacy zip download
app.get('/download-zip', authenticate, async (req, res) => {
    try {
        const { fileIds, courseCode } = req.query;
        if (!fileIds || !courseCode) return res.status(400).json({ error: 'fileIds and courseCode required' });
        const ids = fileIds.split(',').map(id => parseInt(id));
        const files = await dataService.getFiles(req.user.userId, req.user.role);
        const filesToDownload = files.filter(f => ids.includes(f.id));
        if (!filesToDownload.length) return res.status(404).json({ error: 'No matching files' });

        const zipFilename = `${courseCode}_${new Date().toISOString().split('T')[0]}_submissions.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', err => { throw err; });
        archive.pipe(res);
        filesToDownload.forEach(file => {
            const fp = path.join(uploadDir, file.saved_name);
            if (fs.existsSync(fp)) archive.file(fp, { name: `${file.uploader_name}_${file.filename}` });
        });
        await archive.finalize();
    } catch (error) {
        if (!res.headersSent) res.status(500).json({ error: 'Error creating zip' });
    }
});

// Delete file
app.delete('/delete/:fileId', authenticate, (req, res) => {
    try {
        const fileId = req.params.fileId;
        const userId = req.user.userId;
        const files = dataService.getFiles(userId, req.user.role);
        const file = files.find(f => f.id === parseInt(fileId));
        if (!file) return res.status(404).json({ error: "File not found" });

        const filePath = path.join(uploadDir, file.saved_name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        dataService.deleteFile(fileId, userId);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register Peer
app.post('/register-peer', (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP required' });
    res.status(200).json({ message: 'Peer registered' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Data: ${dataDir}`);
    console.log(`Uploads: ${uploadDir}`);
    console.log(`\n  Local:   http://localhost:${PORT}`);
    // Show LAN URL
    const os = require('os');
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`  LAN:     http://${net.address}:${PORT}  ← Share this with others on the same network`);
            }
        }
    }
    console.log('');
});