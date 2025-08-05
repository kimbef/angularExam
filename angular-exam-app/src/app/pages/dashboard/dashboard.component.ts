import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { User } from '../../models/user.interface';
import { Post } from '../../models/post.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  userPosts: Post[] = [];
  recentPosts: Post[] = [];
  isLoading = true;
  error: string | null = null;
  stats = {
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0
  };
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadDashboardData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Load user posts
    this.postService.getUserPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.userPosts = posts;
          this.calculateStats(posts);
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load dashboard data. Please try again later.';
          this.isLoading = false;
          console.error('Error loading user posts:', error);
        }
      });

    // Load recent posts from community
    this.postService.getAllPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.recentPosts = posts.slice(0, 5); // Show 5 most recent posts
        },
        error: (error) => {
          console.error('Error loading recent posts:', error);
        }
      });
  }

  private calculateStats(posts: Post[]): void {
    this.stats.totalPosts = posts.length;
    this.stats.totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    this.stats.totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
    this.stats.totalViews = Math.floor(Math.random() * 1000) + posts.length * 50; // Mock views
  }

  retryLoad(): void {
    this.loadDashboardData();
  }
}
