Development Assignment Requirements

 1. Application Structure
1.1 Public Part (Accessible without Authentication)
Application Start Page
User Login Form
User Registration Form
Public Data (e.g., blog posts, public offers, products, etc.)

 1.2 Private Part (User Area - Available for Registered Users)
Accessible after successful login
User Profile Management
User-specific Data (e.g., user's offers, posts, photos, contacts, etc.)
Logged-in users should stay logged in after refreshing the page

2. General Requirements
The application must use the following technologies, frameworks, and development techniques:

2.1 Dynamic Pages
At least 3 different dynamic pages that render dynamic data.
Pages like About, Contacts, Login, Register, Create, etc. do NOT count towards this figure.

2.2 Specific Views
Catalog View – List of all created records
Details View – Detailed information about a specific record

2.3 CRUD Functionality
At least one collection different from the User collection with full CRUD operations (Create, Read, Update, Delete)
Logged-in users should be able to create records via REST API
Logged-in users should be able to edit and delete their own records
Logged-in users should be able to interact with records (likes, dislikes, comments, etc.)
Guest users should have access only to basic website information (Catalog, Details), but not to interactive functionalities

2.4 Frontend Framework
Use Angular for the client-side

2.5 Client-Server Communication
Communicate with a remote service via REST, Sockets, GraphQL, or similar client-server technique

2.6 Routing
Implement client-side routing to at least 4 pages

At least 1 route with parameters

3. Other Requirements
Apply error handling (conditional rendering based on error responses)
Implement data validation to avoid crashes on invalid inputs
Use an appropriate folder structure
Provide a brief documentation in a .md file describing:
Used frameworks and libraries
How to run the project
Functionality
Application architecture

3.1 Angular-Specific Concepts
Use TypeScript with specific types (avoid using any)
At least 2 interfaces
Use Observables
Use at least 2 RxJS operators
Utilize Lifecycle Hooks
Use Pipes

3.2 Component Styling
Apply styles via external CSS files (at least some)

3.3 Route Guards
Implement Route Guards:
Guests shouldn’t access Private Pages
Logged-in users shouldn’t see Login/Register pages

3.4 Interaction with Records
Users should interact with records (likes, dislikes, comments, etc.) via requests to the REST API

3.5 UI/UX
Ensure Good Usability
Apply Good UI/UX practices (You can follow a Design Best Practice guide)

4. Bonuses
Use of HTML5 features like Geolocation, SVG, Canvas, etc.
Implement Angular Animations
Use RxJS-powered state management (ngRx store)
Any practical feature not described in the assignment counts as a bonus

