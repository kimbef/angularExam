# 🚀 Angular Blog Platform

A modern, full-featured blog platform built with Angular 19 and Firebase, featuring real-time interactions, beautiful glassmorphism design, and comprehensive blog management capabilities.

**🌐 Live Demo:** [https://angularexam-361ce.web.app](https://angularexam-361ce.web.app)

## ✨ Features

### 🌍 **Public Area**
- **Modern Home Page** with hero section, featured posts, and statistics
- **All Posts** listing with filtering and search capabilities
- **Post Details** with like/dislike system and commenting
- **User Registration & Login** with Firebase Authentication
- **Responsive Design** with glassmorphism effects and animations

### 🔐 **Private Area (Authenticated Users)**
- **Interactive Dashboard** with personal stats and activity overview
- **Create & Edit Posts** with rich content management
- **My Posts** with draft/published filtering and status management
- **Publish System** - save drafts and publish when ready
- **User Profile** management and customization
- **Real-time Like/Comment** interactions on dashboard

### 📝 **Advanced Blog Features**
- **Draft System** - create and save posts as drafts before publishing
- **Publish Workflow** - seamless transition from draft to published
- **Real-time Interactions** - likes, dislikes, and comments update instantly
- **User-specific Content** - authors can edit/delete their posts, others can interact
- **Responsive Post Cards** with modern layouts and hover effects

## 🛠️ Technologies & Stack

### **Frontend**
- **Angular 19.2.5** - Latest stable version with standalone components
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming with Observables
- **Angular Router** - Client-side routing with guards
- **Angular Reactive Forms** - Form validation and management

### **Backend & Database**
- **Firebase Authentication** - Secure user management
- **Firebase Realtime Database** - Real-time data synchronization
- **Firebase Hosting** - Production deployment

### **Design & UI**
- **Custom CSS Variables** - Consistent design system
- **Glassmorphism Effects** - Modern visual design
- **Responsive Grid Layouts** - Mobile-first approach
- **Smooth Animations** - Enhanced user experience
- **Custom Components** - Reusable UI elements

## 🏗️ Architecture

### **Component Structure**
```
src/app/
├── components/
│   └── header/                 # Navigation header with user menu
├── pages/
│   ├── home/                   # Landing page with hero section
│   ├── posts/                  # Public posts listing
│   ├── post-detail/            # Individual post view with interactions
│   ├── dashboard/              # User dashboard with stats
│   ├── my-posts/               # User's posts management
│   ├── create-post/            # Post creation form
│   ├── edit-post/              # Post editing interface
│   ├── profile/                # User profile management
│   ├── login/                  # Authentication
│   └── register/               # User registration
├── services/
│   ├── auth.service.ts         # Firebase Authentication
│   ├── post.service.ts         # Post CRUD operations
│   └── firebase.service.ts     # Firebase configuration
├── guards/
│   ├── auth.guard.ts           # Protected route guard
│   └── guest.guard.ts          # Guest-only route guard
└── models/
    ├── user.interface.ts       # User data models
    └── post.interface.ts       # Post data models
```

### **Data Flow**
- **Real-time Listeners** - Firebase Realtime Database for instant updates
- **Observable Patterns** - RxJS for reactive data management
- **State Management** - Service-based state with BehaviorSubjects
- **Route Guards** - Authentication-based access control

### **Database Structure**
```
Firebase Realtime Database:
├── all-posts/                  # Published posts (public read)
│   └── {postId}/              # Individual post data
├── my-posts/                   # User-specific posts (private)
│   └── {userId}/
│       └── {postId}/          # User's posts including drafts
└── users/                      # User profile data
    └── {userId}/              # Individual user information
```

## 🚀 Deployment

- **Platform:** Firebase Hosting
- **URL:** https://angularexam-361ce.web.app
- **Build:** Production-optimized Angular build
- **Hosting Features:** SPA routing, HTTPS, global CDN

## 🔧 Development

### **Prerequisites**
- Node.js (v18+)
- Angular CLI (v19.2.5)
- Firebase CLI

### **Setup**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### **Environment Configuration**
Configure Firebase credentials in:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

## 🎨 Design System

- **Color Palette:** Modern gradients with CSS variables
- **Typography:** Clean, readable font hierarchy
- **Components:** Glassmorphism cards with subtle shadows
- **Animations:** Smooth transitions and hover effects
- **Responsive:** Mobile-first design with flexible layouts

## 🔒 Security Features

- **Firebase Authentication** - Secure user management
- **Database Rules** - Role-based access control
- **Route Guards** - Client-side route protection
- **Input Validation** - Form validation and sanitization

