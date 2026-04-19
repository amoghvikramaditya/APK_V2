# Software Design Principles: APK_V2

This document outlines the core software design principles applied during the development of the Assignment & Portfolio Keeper (APK) project.

## 1. Abstraction
Abstraction is used to hide complex implementation details and show only the necessary features of an object or system.
- **Data Abstraction**: The `DataService` class in `backend/dataService.js` abstracts all SQLite database operations. The main `server.js` doesn't need to know how data is stored or retrieved; it simply calls methods like `registerUser()` or `getFiles()`.
- **API Abstraction**: The frontend `script.js` uses helper functions to manage complex UI states and fetch calls, abstracting the raw HTTP requests away from the UI event handlers.

## 2. Modularity
Modularity is the degree to which a system's components may be separated and recombined.
- **Directory Structure**: The project is strictly divided into `frontend/` and `backend/`, ensuring a clean separation of concerns.
- **Node Modules**: External modules like `express`, `cors`, `multer`, and `jwt` are used to handle specific cross-cutting concerns, keeping the core logic focused.
- **Component-based CSS**: The `styles.css` file uses CSS variables and modular classes (e.g., `.btn`, `.modal`, `.widget`) to ensure consistent styling across different pages.

## 3. Cohesion
Cohesion refers to how closely related the functions within a single module are.
- **High Functional Cohesion**:
    - `dataService.js`: Dedicated exclusively to data persistence and integrity.
    - `server.js`: Focused solely on request routing, authentication, and authorization.
    - `script.js`: (Frontend) Handles DOM manipulation and user interaction logic.

## 4. Low Coupling
Coupling is the degree of interdependence between software modules.
- **API-First Design**: The frontend and backend are loosely coupled via a RESTful JSON API. They communicate over standard HTTP methods, meaning the frontend could be replaced with a native mobile app without changing the backend logic.
- **Stateless Authentication**: Using JWT (JSON Web Tokens) ensures the backend doesn't need to maintain session state for each user, reducing coupling between the server and the horizontal scaling of the application.
- **Dependency Injection (Conceptual)**: The `DataService` is initialized once and used throughout `server.js`, making it easy to swap the underlying storage engine if needed.
