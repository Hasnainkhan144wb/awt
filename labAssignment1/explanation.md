# Full-Stack Blog Application Documentation

## Overview
This document explains the architecture and key code components of the Full-Stack Blog Application developed for Lab Assignment 1. The application is built using Node.js, Express, MongoDB, and EJS, strictly adhering to the MVC (Model-View-Controller) architecture.

## Architecture (MVC)
- **Models**: Defines the data structure. Mongoose schemas (`User.js`, `Post.js`) are used to interact with MongoDB.
- **Views**: The user interface. We use `EJS` templates enhanced with Bootstrap 5 to render dynamic content on the server.
- **Controllers**: The business logic. Controllers (`authController.js`, `postController.js`) handle incoming requests, query the models, and return the appropriate views.
- **Routes**: Define the application's endpoints, mapping URLs to corresponding controller functions.

## Key Features Implementation

### 1. User Authentication
We use `express-session` for managing user login states. The `authController.js` handles user registration by:
- Validating input with `express-validator`.
- Hashing passwords using `bcrypt` before saving to the database.
- Establishing a session upon successful login/registration.

### 2. Blog Management (CRUD)
The `postController.js` implements CRUD functionality:
- **Create**: Uses `express-fileupload` to handle cover images and Quill WYSIWYG editor for rich text content.
- **Read**: The index route fetches all posts, demonstrating the use of Mongoose's `.populate('author')` to pull in the user details of the author.
- **Update**: Users can edit their own posts. Middleware ensures they are the authorized author.
- **Delete**: Users can remove their posts from the database.

### 3. Middleware
Custom middleware (`authMiddleware.js`) protects routes:
- `protect`: Ensures only logged-in users can reach creation/dashboard routes.
- `guest`: Ensures logged-in users don't see the login/register pages.
A global request logging middleware in `server.js` logs every incoming request's timestamp and route.

## Database Design
Two main schemas:
- **User Schema**: Includes validation for `name`, `email` (unique), and `password`, along with timestamps.
- **Post Schema**: Contains `title`, `content`, `image` (file path string), and an `author` field referencing the `User` model. This establishes the one-to-many relationship (One User has Many Posts).

## Security & Validation
- **Input Validation:** Express-validator is applied to routes (e.g. enforcing valid emails and password length).
- **Graceful Error Handling:** Validation errors are passed to the views and displayed as alerts.
- **Secure Storage:** Passwords are never stored in plain text.
