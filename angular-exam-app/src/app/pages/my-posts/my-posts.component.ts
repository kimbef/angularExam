import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.interface';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.css']
})
export class MyPostsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  selectedFilter = 'all';
  sortBy = 'newest';
  showDeleteModal = false;
  postToDelete: Post | null = null;
  isDeleting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadUserPosts();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserPosts(): void {
    this.isLoading = true;
    this.error = null;

    this.postService.getUserPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.posts = posts;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load your posts. Please try again later.';
          this.isLoading = false;
          console.error('Error loading user posts:', error);
        }
      });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.posts];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(post => {
        switch (this.selectedFilter) {
          case 'published':
            return post.isPublished;
          case 'draft':
            return !post.isPublished;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'likes':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    this.filteredPosts = filtered;
  }

  confirmDelete(post: Post): void {
    this.postToDelete = post;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.postToDelete = null;
  }

  deletePost(): void {
    if (!this.postToDelete) return;

    this.isDeleting = true;
    
    this.postService.deletePost(this.postToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== this.postToDelete!.id);
          this.applyFilters();
          this.showDeleteModal = false;
          this.postToDelete = null;
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          this.isDeleting = false;
          // You could show an error message here
        }
      });
  }

  retryLoad(): void {
    this.loadUserPosts();
  }

  trackByPostId(index: number, post: Post): string {
    return post.id;
  }
}
