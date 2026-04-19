# APK File Sharing System

## Vision Document

**Project Name:** APK File-Sharing Portal (Version 2)

**Overview:** An advanced, secure, and modern platform for teachers and students to manage, share, and track assignments seamlessly.

**Problem Statement:** Conventional digital sharing tools, such as Google Drive or standard email infrastructure, are universally generic and lack the stringent security configurations necessary for localized academic environments. They critically lack specialized classroom functionalities, such as assignment-level password protection to enforce strict release schedules, and algorithmic IP-sharing detection to monitor unauthorized student collaboration. This deficiency forces educators to rely on fragmented toolchains to distribute, collect, and verify submissions, ultimately yielding inefficient file-management workflows and risking academic integrity.

**Target Users (Personas):**
- **Teachers/Instructors:** Need to distribute material securely, manage deadlines, and track downloads.
- **Students:** Need to easily access files, submit their assignments securely, and have a good user experience on mobile and desktop.

**Vision Statement:** To provide an ultra-secure and visually exceptional platform for managing digital classrooms, where sharing and submitting assignments is friction-less and protected.

**Key Features & Project Goals:**
- **Granular Access Control:** Implementation of class-specific and assignment-level password encryption, empowering educators to securely stagger the release of examination materials.
- **Academic Integrity Monitoring:** Specialized IP monitoring systems configured to track concurrent assignment submissions from identical network addresses, dynamically flagging potential collusion.
- **Optimized grading Workflows:** Centralized bulk ZIP downloading architectures allowing educators to instantly aggregate entire classroom submissions locally, eliminating the need to parse disparate cloud links.
- **Premium User Experience (UX):** A modern, responsive interface utilizing contemporary glass-morphism and minimal design principles to maximize student engagement and accessibility.
- **Containerized Infrastructure:** Immutable deployment governed by Docker methodologies, inherently eliminating environment-specific deployment bugs across varied operating systems (Windows/macOS/Linux).

**Success Metrics:** Smooth local Docker deployment, >99% uptime during file transfers, UI responsiveness mapping <1s per action.

**Assumptions & Constraints:** Assumes basic knowledge of web navigation. Constraints include maximum file upload sizes due to backend server storage limits.

---

## Branching Strategy
We use **GitHub Flow** for our branching strategy:
- `main` is always deployable and represents the production-ready code.
- Features and bug fixes are developed on new branches created from `main` (e.g., `feature/add-docker-setup` or `add_Usern`).
- Code is merged via Pull Requests after review.

## Quick Start – Local Development (Docker)
Follow these steps to run the application locally using Docker:

1. **Prerequisites**: Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. **Run the Application**: Open your terminal in the project directory and run:
   ```bash
   docker-compose up --build
   ```
3. Once built, open `http://localhost:3000` in your web browser.
4. Stop the container with `docker-compose down`.

**Local Development Tools:** Git, GitHub, Docker, Docker Compose, Figma (Design), Draw.io (Architecture)

---

## Key System Features

### For Teachers (Administrators)
- **Classroom Generation**: Create distinct classes and manage coursework independently.
- **Secure File Distribution**: Upload class materials locked behind cryptographic passwords.
- **Deadline Management**: Assign real-time deadlines to submissions that auto-lock when time expires.
- **Analytics & IP Flagging**: Monitor exactly who submitted assignments, with network IP tracking that automatically flags shared device fraud.

### For Students
- **Dynamic Dashboard**: View and navigate enrolled classes with real-time deadline warnings.
- **Secure Submissions**: Upload and overwrite (before deadlines) coursework securely.
- **Resource Repository**: Download resources directly from teachers after verifying access.

---

## Tech Stack
- **Frontend Layer**: Pure HTML5, CSS3 (Glassmorphism design strategy), and Vanilla JavaScript for maximum performance and minimum dependency bloat.
- **Backend Architecture**: Node.js and Express.js REST API.
- **Data Persistence**: SQLite integrated via `better-sqlite3` for robust, portable database tracking.
- **Infrastructure**: Containerized natively through Docker and Docker Compose for ubiquitous deployment.

---

## Repository Structure
```text
APK_PORTAL/
 ┣ backend/
 ┃ ┣ data/             # SQLite Database Volume
 ┃ ┣ uploads/          # Encrypted student submissions
 ┃ ┣ dataService.js    # Database I/O Handlers
 ┃ ┗ server.js         # Express API Router
 ┣ frontend/
 ┃ ┣ dashboard.html    # Main Student/Teacher Dashboard
 ┃ ┣ index.html        # Auth Portal
 ┃ ┣ script.js         # Client-side Logic Controller
 ┃ ┗ styles.css        # UI Token System
 ┣ Dockerfile          # Container Build Instructions
 ┣ docker-compose.yml  # Orchestration details
 ┣ package.json        # Node Package tracking
 ┗ README.md           # You are here
```

---
*Created for Educational Digital Management. Protected via MIT License.*

 