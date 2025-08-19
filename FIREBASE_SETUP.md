# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "angular-blog-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Set up Firebase Authentication

1. In your Firebase project console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## 3. Set up Firebase Realtime Database

1. In your Firebase project console, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## 4. Get Firebase Configuration

1. Go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</> icon)
4. Enter an app name (e.g., "Angular Blog App")
5. Click "Register app"
6. Copy the Firebase configuration object

## 5. Update Environment Files

Replace the placeholder values in these files with your actual Firebase configuration:

### src/environments/environment.ts
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
  }
};
```

### src/environments/environment.prod.ts
```typescript
export const environment = {
  production: true,
  firebase: {
    // Same configuration as above
  }
};
```

## 6. Set up Database Security Rules (Optional for Development)

For development, you can use these permissive rules (NOT for production):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

For production, implement proper security rules based on your data structure.

## 7. Test the Setup

1. Run `npm start` to start the development server
2. Go to `http://localhost:4200`
3. Try to register a new user
4. Try to create a new post
5. Check the Firebase console to see if data is being stored

## Database Structure

The app will create the following structure in your Realtime Database:

```
{
  "users": {
    "userId": {
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "avatar-url",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  },
  "all-posts": {
    "postId": {
      "title": "Post Title",
      "content": "Post content...",
      "author": { "id": "userId", "username": "username", "avatar": "url" },
      "likes": 0,
      "dislikes": 0,
      "likedBy": [],
      "dislikedBy": [],
      "comments": [],
      "isPublished": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  },
  "my-posts": {
    "userId": {
      "postId": {
        // Same structure as all-posts
      }
    }
  }
}
```

## Features Implemented

✅ **Firebase Authentication**
- User registration with email/password
- User login with email/password
- Automatic authentication state management
- Secure logout functionality

✅ **Real-time Database Integration**
- Posts persist across page refreshes
- Real-time updates when posts are added/edited
- Separate collections for "all-posts" and "my-posts"

✅ **Post Management**
- Create new posts (fixed the previous issue)
- Edit posts (only if you're the author)
- Delete posts (only if you're the author)
- Publish/unpublish posts

✅ **Interaction Features**
- Like/dislike posts (prevents duplicate interactions)
- Add comments to posts
- View post details

✅ **Authorization**
- Users can only edit/delete their own posts
- Non-authors can only like/dislike and comment
- Authentication required for all post operations

## Next Steps

1. Configure your Firebase project as described above
2. Update the environment files with your actual Firebase configuration
3. Test the application
4. Set up proper security rules for production
5. Consider adding more features like image upload, categories, etc.
