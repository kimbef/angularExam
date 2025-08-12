# AngularExamApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.5.

## Description

This is a Single Page Application (SPA) built with Angular, featuring a public area (accessible without login) and a private area (accessible after login). It includes dynamic content rendering, full CRUD functionalities for posts, client-side routing, user authentication, and REST API communication.

## Functionalities

*   **Public Area:**
    *   Home page
    *   User Login and Registration
    *   Public data listing (posts)
    *   Post details view
*   **Private Area (User Area - Requires Login):**
    *   Dashboard
    *   User Profile Management
    *   User's Posts
    *   Create Post
    *   Edit Post
*   **CRUD Operations:** Create, Read, Update, and Delete posts.
*   **User Authentication:** Login, Registration, and persistent sessions.

## Technologies and Libraries

*   Angular (latest stable version)
*   TypeScript
*   RxJS
*   Angular Router
*   Angular Forms
*   Angular HttpClient

## High-Level Application Architecture Overview

The application follows a component-based architecture.

*   **Components:** Each page and UI element is implemented as an Angular component.
*   **Services:**
    *   `AuthService`: Handles user authentication (login, registration, logout) and session management.
    *   `PostService`: Manages data fetching and CRUD operations for posts.
*   **Routing:** Angular Router is used for navigation between different pages. Route guards (`AuthGuard`, `GuestGuard`) are used to protect routes based on user authentication status.
*   **Data Flow:** Components interact with services to fetch and update data. Observables are used for asynchronous data handling.
*   **API Communication:** The application communicates with a mock REST API using `HttpClient`.

