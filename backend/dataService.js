const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

class DataService {
    constructor() {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        this.db = new Database(path.join(dataDir, 'apk.db'));
        this.db.pragma('journal_mode = WAL');
        this.initTables();
    }

    initTables() {
        // Users table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL,
                password TEXT NOT NULL,
                course_codes TEXT NOT NULL DEFAULT ''
            )
        `).run();

        // Classes table (new — proper class management with passwords)
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_code TEXT UNIQUE NOT NULL,
                teacher_id INTEGER NOT NULL,
                password TEXT DEFAULT '',
                created_at TEXT NOT NULL,
                FOREIGN KEY (teacher_id) REFERENCES users(id)
            )
        `).run();

        // Files table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                upload_date TEXT NOT NULL,
                saved_name TEXT NOT NULL,
                course_code TEXT NOT NULL,
                ip_address TEXT,
                assignment_file_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (assignment_file_id) REFERENCES files(id)
            )
        `).run();

        // Migrations for existing databases
        const migrations = [
            'ALTER TABLE files ADD COLUMN ip_address TEXT',
            'ALTER TABLE files ADD COLUMN assignment_file_id INTEGER',
            'ALTER TABLE files ADD COLUMN deadline TEXT',
            'ALTER TABLE files ADD COLUMN assignment_password TEXT DEFAULT ""'
        ];
        for (const sql of migrations) {
            try { this.db.prepare(sql).run(); } catch (e) { /* column exists */ }
        }

        // Migrate existing teacher course codes into classes table
        this._migrateClassesFromUsers();
    }

    _migrateClassesFromUsers() {
        try {
            const teachers = this.db.prepare("SELECT id, course_codes FROM users WHERE role = 'teacher'").all();
            for (const t of teachers) {
                const codes = (t.course_codes || '').split(',').filter(c => c.trim());
                for (const code of codes) {
                    const exists = this.db.prepare('SELECT id FROM classes WHERE course_code = ?').get(code.trim());
                    if (!exists) {
                        this.db.prepare('INSERT OR IGNORE INTO classes (course_code, teacher_id, password, created_at) VALUES (?, ?, ?, ?)').run(
                            code.trim(), t.id, '', new Date().toISOString()
                        );
                    }
                }
            }
        } catch (e) { /* safe to ignore on first run */ }
    }

    // ============ USER METHODS ============

    async registerUser(name, username, role, password, courseCodes = []) {
        try {
            const existingUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get(username);
            if (existingUser) throw new Error('Username already exists');

            const hashedPassword = await bcrypt.hash(password, 10);
            const courseCodesStr = courseCodes.join(',');

            const stmt = this.db.prepare('INSERT INTO users (name, username, role, password, course_codes) VALUES (?, ?, ?, ?, ?)');
            const info = stmt.run(name, username, role, hashedPassword, courseCodesStr);

            return { id: info.lastInsertRowid, name, username, role, course_codes: courseCodesStr };
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }

    async loginUser(username, password) {
        try {
            const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
            if (!user) throw new Error('Invalid username or password');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) throw new Error('Invalid username or password');

            return { id: user.id, name: user.name, username: user.username, role: user.role, course_codes: user.course_codes };
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }

    getUserById(userId) {
        try {
            return this.db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(userId));
        } catch (error) {
            console.error('Error getting user:', error);
            throw new Error('Failed to retrieve user');
        }
    }

    // ============ CLASS METHODS ============

    createClass(userId, courseCode, password = '') {
        try {
            const user = this.getUserById(userId);
            if (!user) throw new Error('User not found');
            if (user.role !== 'teacher') throw new Error('Only teachers can create classes');

            // Check if class already exists
            const existing = this.db.prepare('SELECT id FROM classes WHERE course_code = ?').get(courseCode.trim());
            if (existing) throw new Error('Class with this code already exists');

            // Insert into classes table
            this.db.prepare('INSERT INTO classes (course_code, teacher_id, password, created_at) VALUES (?, ?, ?, ?)').run(
                courseCode.trim(), parseInt(userId), password || '', new Date().toISOString()
            );

            // Also add to user's course_codes for backward compat
            const codes = (user.course_codes || '').split(',').filter(c => c.trim());
            if (!codes.includes(courseCode.trim())) {
                codes.push(courseCode.trim());
                this.db.prepare('UPDATE users SET course_codes = ? WHERE id = ?').run(codes.join(','), parseInt(userId));
            }

            return { courseCode: courseCode.trim(), message: 'Class created successfully' };
        } catch (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    }

    joinClass(userId, courseCode, password = '') {
        try {
            const user = this.getUserById(userId);
            if (!user) throw new Error('User not found');
            if (user.role !== 'student') throw new Error('Only students can join classes');

            // Check class exists
            const cls = this.db.prepare('SELECT * FROM classes WHERE course_code = ?').get(courseCode.trim());
            if (!cls) {
                // Also check teacher course_codes for backward compat
                const allTeachers = this.db.prepare("SELECT course_codes FROM users WHERE role = 'teacher'").all();
                let found = false;
                for (const t of allTeachers) {
                    const codes = (t.course_codes || '').split(',').map(c => c.trim());
                    if (codes.includes(courseCode.trim())) { found = true; break; }
                }
                if (!found) throw new Error('Class not found. Please check the course code.');
            }

            // Check password if class has one
            if (cls && cls.password && cls.password.trim()) {
                if (!password || password !== cls.password) {
                    throw new Error('Incorrect class password');
                }
            }

            // Check if already enrolled
            const codes = (user.course_codes || '').split(',').filter(c => c.trim());
            if (codes.includes(courseCode.trim())) throw new Error('You are already in this class');

            codes.push(courseCode.trim());
            this.db.prepare('UPDATE users SET course_codes = ? WHERE id = ?').run(codes.join(','), parseInt(userId));

            return { courseCode: courseCode.trim(), message: 'Joined class successfully' };
        } catch (error) {
            console.error('Error joining class:', error);
            throw error;
        }
    }

    getUserClasses(userId) {
        try {
            const user = this.getUserById(userId);
            if (!user) throw new Error('User not found');
            const codes = (user.course_codes || '').split(',').filter(c => c.trim());
            return codes.map(code => {
                const cls = this.db.prepare('SELECT password FROM classes WHERE course_code = ?').get(code);
                return { courseCode: code, hasPassword: !!(cls && cls.password && cls.password.trim()) };
            });
        } catch (error) {
            console.error('Error getting classes:', error);
            throw error;
        }
    }

    getClassPassword(courseCode, teacherId) {
        const cls = this.db.prepare('SELECT * FROM classes WHERE course_code = ? AND teacher_id = ?').get(courseCode.trim(), parseInt(teacherId));
        if (!cls) throw new Error('Class not found or not your class');
        return cls.password || '';
    }

    updateClassPassword(courseCode, teacherId, newPassword) {
        const cls = this.db.prepare('SELECT id FROM classes WHERE course_code = ? AND teacher_id = ?').get(courseCode.trim(), parseInt(teacherId));
        if (!cls) throw new Error('Class not found or not your class');
        this.db.prepare('UPDATE classes SET password = ? WHERE id = ?').run(newPassword, cls.id);
        return { message: 'Password updated' };
    }

    // ============ ASSIGNMENT / FILE METHODS ============

    getClassAssignments(courseCode) {
        try {
            const stmt = this.db.prepare(`
                SELECT f.id, f.filename, f.user_id, f.upload_date, f.saved_name, f.course_code, f.deadline, f.assignment_password,
                       u.name as uploader_name, u.role as uploader_role
                FROM files f
                LEFT JOIN users u ON f.user_id = u.id
                WHERE f.course_code = ? AND u.role = 'teacher' AND f.assignment_file_id IS NULL
                ORDER BY f.upload_date DESC
            `);
            return stmt.all(courseCode.trim());
        } catch (error) {
            console.error('Error getting assignments:', error);
            throw error;
        }
    }

    getAssignmentSubmissions(assignmentFileId) {
        try {
            const stmt = this.db.prepare(`
                SELECT f.id, f.filename, f.user_id, f.upload_date, f.saved_name, f.course_code, f.ip_address,
                       u.name as uploader_name, u.role as uploader_role
                FROM files f
                LEFT JOIN users u ON f.user_id = u.id
                WHERE f.assignment_file_id = ?
                ORDER BY f.upload_date DESC
            `);
            return stmt.all(parseInt(assignmentFileId));
        } catch (error) {
            console.error('Error getting submissions:', error);
            throw error;
        }
    }

    getUserSubmissions(userId) {
        try {
            const stmt = this.db.prepare(`
                SELECT f.id, f.filename, f.user_id, f.upload_date, f.saved_name, f.course_code, f.assignment_file_id,
                       u.name as uploader_name,
                       af.filename as assignment_name
                FROM files f
                LEFT JOIN users u ON f.user_id = u.id
                LEFT JOIN files af ON f.assignment_file_id = af.id
                WHERE f.user_id = ? AND f.assignment_file_id IS NOT NULL
                ORDER BY f.upload_date DESC
            `);
            return stmt.all(parseInt(userId));
        } catch (error) {
            console.error('Error getting user submissions:', error);
            throw error;
        }
    }

    // Get ALL submissions for a class (for zip download)
    getClassSubmissions(courseCode) {
        try {
            const stmt = this.db.prepare(`
                SELECT f.id, f.filename, f.user_id, f.upload_date, f.saved_name, f.course_code, f.assignment_file_id, f.ip_address,
                       u.name as uploader_name, u.role as uploader_role,
                       af.filename as assignment_name
                FROM files f
                LEFT JOIN users u ON f.user_id = u.id
                LEFT JOIN files af ON f.assignment_file_id = af.id
                WHERE f.course_code = ? AND f.assignment_file_id IS NOT NULL
                ORDER BY af.filename ASC, u.name ASC
            `);
            return stmt.all(courseCode.trim());
        } catch (error) {
            console.error('Error getting class submissions:', error);
            throw error;
        }
    }

    setAssignmentDeadline(fileId, teacherId, deadline) {
        const file = this.db.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').get(parseInt(fileId), parseInt(teacherId));
        if (!file) throw new Error('Assignment not found or not yours');
        this.db.prepare('UPDATE files SET deadline = ? WHERE id = ?').run(deadline, parseInt(fileId));
        return { message: 'Deadline updated' };
    }

    setAssignmentPassword(fileId, teacherId, password) {
        const file = this.db.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?').get(parseInt(fileId), parseInt(teacherId));
        if (!file) throw new Error('Assignment not found or not yours');
        this.db.prepare('UPDATE files SET assignment_password = ? WHERE id = ?').run(password || '', parseInt(fileId));
        return { message: 'Assignment password updated' };
    }

    getAssignmentById(fileId) {
        return this.db.prepare('SELECT * FROM files WHERE id = ?').get(parseInt(fileId));
    }

    // Check if student has submitted to an assignment (for password bypass on download)
    hasStudentSubmitted(userId, assignmentFileId) {
        const sub = this.db.prepare('SELECT id FROM files WHERE user_id = ? AND assignment_file_id = ?').get(parseInt(userId), parseInt(assignmentFileId));
        return !!sub;
    }

    addFile(filename, userId, savedName, courseCode, ipAddress, assignmentFileId = null, deadline = null, assignmentPassword = '') {
        try {
            const userIdInt = parseInt(userId);
            const uploadDate = new Date().toISOString();

            const stmt = this.db.prepare(`
                INSERT INTO files (filename, user_id, upload_date, saved_name, course_code, ip_address, assignment_file_id, deadline, assignment_password)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const info = stmt.run(filename, userIdInt, uploadDate, savedName, courseCode, ipAddress, assignmentFileId, deadline, assignmentPassword);

            return {
                id: info.lastInsertRowid, filename, user_id: userIdInt, upload_date: uploadDate,
                saved_name: savedName, course_code: courseCode, ip_address: ipAddress,
                assignment_file_id: assignmentFileId, deadline, assignment_password: assignmentPassword
            };
        } catch (error) {
            console.error('Error adding file:', error);
            throw new Error('Failed to add file to database');
        }
    }

    getFiles(userId, role) {
        try {
            const userIdInt = parseInt(userId);
            const currentUser = this.db.prepare('SELECT course_codes FROM users WHERE id = ?').get(userIdInt);
            const userCourseCodes = currentUser && currentUser.course_codes ? currentUser.course_codes.split(',') : [];

            const allFilesStmt = this.db.prepare(`
                SELECT f.id, f.filename, f.user_id, f.upload_date, f.saved_name, f.course_code, f.ip_address, f.assignment_file_id, f.deadline, f.assignment_password,
                       u.name as uploader_name, u.role as uploader_role
                FROM files f
                LEFT JOIN users u ON f.user_id = u.id
            `);
            const filesWithUserInfo = allFilesStmt.all();

            if (role === 'teacher') {
                return filesWithUserInfo.filter(file => userCourseCodes.includes(file.course_code));
            } else {
                return filesWithUserInfo.filter(file => {
                    const isOwnFile = file.user_id === userIdInt;
                    const isTeacherFile = file.uploader_role === 'teacher';
                    const hasMatchingCourseCode = file.course_code && userCourseCodes.includes(file.course_code);
                    return isOwnFile || (isTeacherFile && hasMatchingCourseCode);
                });
            }
        } catch (error) {
            console.error('Error getting files:', error);
            throw new Error('Failed to retrieve files');
        }
    }

    deleteFile(fileId, userId) {
        try {
            const info = this.db.prepare('DELETE FROM files WHERE id = ? AND user_id = ?').run(parseInt(fileId), parseInt(userId));
            if (info.changes === 0) throw new Error('File not found or not authorized');
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
}

module.exports = new DataService();