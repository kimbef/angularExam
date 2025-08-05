import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'posts',
    loadComponent: () => import('./pages/posts/posts.component').then(m => m.PostsComponent)
  },
  {
    path: 'posts/:id',
    loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.PostDetailComponent)
  },
  
  // Private routes (requires authentication)
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-posts',
    loadComponent: () => import('./pages/my-posts/my-posts.component').then(m => m.MyPostsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'create-post',
    loadComponent: () => import('./pages/create-post/create-post.component').then(m => m.CreatePostComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-post/:id',
    loadComponent: () => import('./pages/edit-post/edit-post.component').then(m => m.EditPostComponent),
    canActivate: [AuthGuard]
  },
  
  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: ''
  }
];
