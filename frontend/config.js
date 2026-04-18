// Get the current hostname (IP address or domain)
const serverAddress = window.location.hostname;
const serverPort = 3000;
const serverUrl = `http://${serverAddress}:${serverPort}`;

window.config = {
    apiUrl: serverUrl,
    endpoints: {
        login: `${serverUrl}/login`,
        register: `${serverUrl}/register`,
        upload: `${serverUrl}/upload`,
        files: `${serverUrl}/files`,
        download: (filename) => `${serverUrl}/download/${filename}`,
        downloadZip: `${serverUrl}/download-zip`,
        delete: (fileId) => `${serverUrl}/delete/${fileId}`,
        // Classes
        classes: `${serverUrl}/classes`,
        classJoin: `${serverUrl}/classes/join`,
        classPassword: (code) => `${serverUrl}/classes/${encodeURIComponent(code)}/password`,
        classAssignments: (code) => `${serverUrl}/classes/${encodeURIComponent(code)}/assignments`,
        classSubmissionsZip: (code) => `${serverUrl}/classes/${encodeURIComponent(code)}/submissions/zip`,
        // Assignments
        assignmentSubmissions: (id) => `${serverUrl}/assignments/${id}/submissions`,
        assignmentSubmissionsZip: (id) => `${serverUrl}/assignments/${id}/submissions/zip`,
        assignmentDeadline: (id) => `${serverUrl}/assignments/${id}/deadline`,
        assignmentPassword: (id) => `${serverUrl}/assignments/${id}/password`,
        assignmentCheckPassword: (id) => `${serverUrl}/assignments/${id}/check-password`,
        assignmentValidatePassword: (id) => `${serverUrl}/assignments/${id}/validate-password`,
        // Submissions
        submissions: `${serverUrl}/submissions`
    }
};

window.addEventListener('error', function(e) {
    if (e.filename && e.filename.includes('config.js')) {
        console.error('Configuration error:', e.message);
    }
});