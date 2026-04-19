# Digital Assignment 3 / Review 3: Professional Project Report
**Student Name:** Amogh Vikramaditya  
**Registration Number:** 23BCE1225  
**Course:** Software Engineering (DA-3 / Review 3)  
**Project:** APK (Assignment & Portfolio Keeper) Portal  
**Document Version:** 3.0 (Thesis-Grade Master Report)

---

## Table of Contents
1. **SECTION A: SUBMISSION PORTFOLIO**...................................................................... 2
   - 1.1 Local Automated Testing Evidence (Integration & Mutation)
   - 1.2 Version Management & Docker Orchestration
   - 1.3 Detailed Functionality Walkthrough (16+ Features)
   - 1.4 Comprehensive Tools & Technologies Analysis
2. **SECTION B: PROJECT DEMO**.................................................................................... 12
3. **SECTION C: PROJECT REPORT**................................................................................ 14
   - 3.1 Problem Statement & Background Analysis
   - 3.2 User Stories (25 Detailed Stories with Acceptance Criteria)
   - 3.3 System Architecture & Logical Tier Decomposition
   - 3.4 Design of Tests (Local Master Plan & TC Matrix)
   - 3.5 Appendix — Formal SRS Specification (FR & NFR Deep-Dive)
   - 3.6 Appendix — Data Flow Analysis (DFD Level 0 & 1)
   - 3.7 Appendix — Entity Relationship Diagram (ERD) Schema
   - 3.8 Appendix — Unified UML Diagrams Suite Analysis
   - 3.9 Code Listing & High-Level Core Logic Snippets

---

# SECTION A: SUBMISSION PORTFOLIO

## 1. Local Automated Testing Evidence
The APK Portal implements a rigorous local testing architecture using the Mocha and Stryker framework to ensure fail-safe operations of academic integrity modules.

### 1.1 Integration Testing (API & Database Tier)
Our integration suite validates the end-to-end data lifecycle, from HTTP request intercept (via Supertest) to persistent storage in the SQLite relational engine.
[IMAGE PLACEHOLDER: paste docs/testing/integration_test_results.png here]
📸 **📸 A.1.1: Local terminal output confirming 100% pass rate for classroom and auth integration tests.**

### 1.2 Mutation Testing (Local Quality Metrics)
Using **Stryker-js**, we perform mutation analysis to ensure our tests are resilient against logic inversions.
[IMAGE PLACEHOLDER: paste docs/testing/mutation_testing_report.png here]
[IMAGE PLACEHOLDER: paste docs/testing/mutation_testing_summary_terminal.png here]
📸 **📸 A.1.2: Mutation analysis dashboard (HTML and Terminal) measuring the "lethality" of our test cases.**

---

## 2. Version Management & System Building
Professional infrastructure management focused on local development reliability and environment portability.

### 2.1 GitHub Flow & Repository Structure
The project follows a standard Feature-Branch workflow with a strictly organized directory hierarchy.
[IMAGE PLACEHOLDER: paste docs/gihub_ss/github_repo_structure.png here]
[IMAGE PLACEHOLDER: paste docs/gihub_ss/github_branches.png here]
📸 **📸 A.2.1: Multi-branch repository structure on GitHub with 100% code isolation.**

### 2.2 System Orchestration (Docker Compose)
The entire APK stack is orchestrated via Docker, ensuring that the local SQLite database and file system are consistently mounted across any host machine.
[IMAGE PLACEHOLDER: paste docs/docker/docker_system_build_output.png here]
[IMAGE PLACEHOLDER: paste docs/docker/docker_desktop_build_details.png here]
📸 **📸 A.2.2: Docker orchestration logs confirming successful local containerization of Node.js and SQLite layers.**

---

## 3. Developed Functionalities
The APK Portal combines a high-fidelity glassmorphism aesthetic with mission-critical security features.

### 3.1 Authentication & Multi-Mode Interface
[IMAGE PLACEHOLDER: paste docs/functionalities/func_auth_login_dark_mode.png here]
[IMAGE PLACEHOLDER: paste docs/functionalities/func_auth_login_light_mode.png here]
📸 **📸 A.3.1: Dual-mode login interface demonstrating the system's dynamic theme engine.**

### 3.2 Security USP: IP-Sharing Detection
The primary technical differentiator: flagging academic dishonesty by cross-referencing network origin metadata.
[IMAGE PLACEHOLDER: paste docs/functionalities/func_teacher_alert_ip_sharing_view.png here]
[IMAGE PLACEHOLDER: paste docs/functionalities/func_teacher_submissions_ip_conflict_details.png here]
📸 **📸 A.3.2: Real-time conflict alerts on the teacher dashboard during concurrent IP submissions.**

---

## 4. Tools & Technologies Analysis
| Category | Technology | Technical Purpose in APK |
| :--- | :--- | :--- |
| **Frontend** | Vanilla HTML/JS/CSS | Clean, dependency-free UI engine with HSL theme support. |
| **API Layer** | Node.js + Express | Orchestrates JWT auth, file streaming, and IP logging. |
| **Logic** | Multer | Secures file uploads with sanitized filenames and 50MB limits. |
| **Database** | SQLite3 | Local, serverless relational database for high R/W efficiency. |
| **Security** | Bcrypt + JWT | Stateless session management and salted password hashing. |
| **Infrastructure** | Docker | Cross-platform portability and consistent storage mounting. |

---

# SECTION B: PROJECT DEMO
The demo presents the **APK Security Engine**:
1. **Teacher Action**: Creating a classroom with code `SE-2026`.
2. **Student Action**: Submitting a PDF from a shared local network.
3. **Detection**: The system logs the student's IP and immediately flags any overlap as **"Shared IP"** in the teacher's administrative portal, enabling instant integrity verification.

---

# SECTION C: PROJECT REPORT

## 1. Problem Statement
Manual assignment management in educational settings often lacks automated origin tracking. Existing solutions are either too bloated or fail to identify "local collaboration" (IP-sharing). APK Portal provides a lightweight, local-first solution that prioritizes **integrity through metadata verification**.

---

## 2. User Stories (25 Stories Integrated)
Derived from the GitHub Project Issue Tracker:

| ID | Category | User Story | Priority |
| :--- | :--- | :--- | :--- |
| **US-01** | Auth | As a Teacher, I want to securely register an account so that I can create and manage my digital classroom. | Must |
| **US-02** | Auth | As a Student, I want to create an account so that I can access class materials and submit assignments. | Must |
| **US-03** | Auth | As a User, I want to log in using my credentials so that my identity is verified. | Must |
| **US-04** | Auth | As a User, I want to be able to reset my password if I forget it. | Should |
| **US-05** | Admin | As an Administrator, I want to be able to suspend user accounts for inappropriate behavior. | Could |
| **US-06** | Distribution | As a Teacher, I want to create a new Class to organize materials logically. | Must |
| **US-07** | Distribution | As a Teacher, I want to upload files (PDFs, PPTs, ZIPs) to a specific class. | Must |
| **US-08** | Security | As a Teacher, I want to set a password for a class for restricted access. | Must |
| **US-09** | Analytics | As a Teacher, I want to see who downloaded files to track engagement. | Should |
| **US-10** | Distribution | As a Teacher, I want to delete old files to maintain workspace hygiene. | Should |
| **US-11** | Distribution | As a Teacher, I want to upload multiple files at once. | Should |
| **US-12** | Distribution | As a Teacher, I want to organize uploaded files into folders. | Could |
| **US-13** | Student | As a Student, I want to view a dashboard of available classes. | Must |
| **US-14** | Student | As a Student, I want to download files uploaded by my teacher. | Must |
| **US-15** | Security | As a Student, I want to enter a password to unlock materials. | Must |
| **US-16** | Student | As a Student, I want to upload my completed assignment. | Must |
| **US-17** | Student | As a Student, I want to view assignment deadlines. | Should |
| **US-18** | Student | As a Student, I want to replace my submission before deadline. | Should |
| **US-19** | Student | As a Student, I want to bulk download files. | Could |
| **US-20** | Security | As a Teacher, I want to restrict access to local network range. | Must |
| **US-21** | Security | As a Teacher, I want to block multiple IP logins for the same account. | Should |
| **US-22** | Security | As an Admin, I want passwords hashed in the database. | Should |
| **US-23** | UI/UX | As a User, I want a fully responsive interface for mobile/tablet. | Must |
| **US-24** | UI/UX | As a User, I want a modern glassmorphic UI design. | Should |
| **US-25** | UI/UX | As a User, I want a dark/light mode toggle. | Could |

[IMAGE PLACEHOLDER: paste docs/gihub_ss/github_user_stories_issues.png here]
📸 **📸 C.2.1: Integrated User Story tracking in GitHub with Epic and Priority labels.**

---

## 3. System Architecture & High-Level Design
APK Portal follows a **Layered Client-Server Architecture**.

### 3.1 Component Breakdown
1. **Presentation Layer**: Optimized Vanilla Web front-end utilizing modern CSS variables for theme orchestration.
2. **Application Layer (Express.js)**: Responsible for stateless session management (JWT) and payload sanitization (Multer).
3. **Data Service Layer**: A custom wrapper around SQLite that ensures transaction atomicity for every file record created.
4. **Storage Layer**: A local, recursively-managed file system configured for automatic directory health checks on boot.

### 3.2 System Architecture Diagram
[IMAGE PLACEHOLDER: paste docs/design/arch.drawio.png here]
📸 **📸 C.3.2: Logical system architecture mapping the flow from UI to Persistence.**

---

## 4. Design of Tests (Local Master Plan)
Testing is conducted locally to simulate real-world classroom network environments.

### 4.1 Automated Test Suites
- **Integration**: Validating that the `IP_ADDRESS` header is correctly captured and associated with a unique `USER_ID`.
- **Mutation (Stryker)**: Ensuring logic-critical sections (like IP conflict matching) are tested against "intentional logic failures".
- **RBAC Verification**: Confirming that Students are strictly blocked from the `ADMIN_SUSPENSION` routes.

### 4.2 Test Matrix (Sample Scenarios)
| TC# | Objective | Step | Expected |
| :--- | :--- | :--- | :--- |
| **TC-01** | IP Collision | Submit two files from same IP | Status "Shared" in DB |
| **TC-02** | File Security | Request file without Class Pwd | HTTP 403 Forbidden |
| **TC-03** | Auth | Login with incorrect Bcrypt pwd | HTTP 401 Unauthorized |

---

## 5. Appendix

### 5.a Formal SRS (Functional & Non-Functional)

#### Detailed Functional Requirements (FR)
- **FR-01: Admin Authorization**: New teachers MUST provide the secret key `TEACHER123` to authorize account creation.
- **FR-02: Filename Sanitization**: ALL uploaded files MUST have special characters removed (`[^a-zA-Z0-9.-]`) before filesystem entry to prevent path injection.
- **FR-03: Startup Health Integrity**: The server MUST recursively check for and create `uploads/`, `data/`, and `frontend/` directories on initialization.
- **FR-04: Stateless Connectivity**: System MUST utilize JWT tokens with a 24-hour TTL (Time To Live).

#### Detailed Non-Functional Requirements (NR)
- **NR-01: Storage Efficiency**: Total database footprint SHOULD be <50MB for up to 10,000 records (optimized SQLite indices).
- **NR-02: Payload Limit**: Backend MUST enforce a strict `50MB` file size limit per upload to prevent server memory exhaustion.
- **NR-03: Security Hashing**: Passwords MUST be hashed using Bcrypt with a minimum salt-factor of 10.
- **NR-04: Compatibility**: System MUST use Node.js `path.join` for cross-platform (Windows/Linux/OSX) path resolution.

### 5.b Data Flow Diagrams (DFD)
[IMAGE PLACEHOLDER: paste docs/uml/Level0 dfd.png here]
[IMAGE PLACEHOLDER: paste docs/uml/Level 1 dfd.png here]
📸 **📸 C.5.b: DFD Level 0 (Context) and Level 1 mapping APK data routing.**

### 5.c Entity Relationship Diagram (ERD) Schema
[IMAGE PLACEHOLDER: paste docs/uml/ERD.png here]
📸 **📸 C.5.c: Normalized database schema for Users, Classrooms, and Submissions.**

### 5.d Unified UML Diagrams Suite Analysis
[IMAGE PLACEHOLDER: paste docs/uml/Activity.png here]
[IMAGE PLACEHOLDER: paste docs/uml/usecase.png here]
[IMAGE PLACEHOLDER: paste docs/uml/sequence diagram 1.png here]
[IMAGE PLACEHOLDER: paste docs/uml/class.png here]
[IMAGE PLACEHOLDER: paste docs/uml/State machine.png here]
[IMAGE PLACEHOLDER: paste docs/uml/deployment.png here]
📸 **📸 C.5.d: Full professional UML suite covering system behavior and structural constraints.**

---

### 5.e Code Listing & High-Level Core Logic
**Core Integrity Check: IP Overlay Identification**
```javascript
// Identifying academic dishonesty by cross-referencing IP origin
const existing = submissions.find(s => s.ip === reqIp && s.userId !== currentUserId);
if (duplicateFound) {
    record.status = 'SHARED_ORIGIN'; // Flag for Teacher Dashboard
}
```

**Security Middleware: Bcrypt Verification**
```javascript
// Validating user identity against salted persistence
const isValid = await bcrypt.compare(incomingPwd, dbRecord.hashedPassword);
if (!isValid) throw new Error("Invalid Credentials");
```
