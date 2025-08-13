import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.interface';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  currentUser: User | null = null;
  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = ['All', 'General', 'Technology', 'Lifestyle', 'Travel', 'Food'];
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Setup search with debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterPosts();
    });

    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPosts(): void {
    this.isLoading = true;
    this.error = null;

    this.postService.getAllPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.posts = posts;
          this.filteredPosts = posts;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load posts. Please try again later.';
          this.isLoading = false;
          console.error('Error loading posts:', error);
        }
      });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchSubject.next(target.value);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterPosts();
  }

  private filterPosts(): void {
    let filtered = this.posts;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term) ||
        post.author.username.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (this.selectedCategory && this.selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === this.selectedCategory);
    }

    this.filteredPosts = filtered;
  }

  likePost(post: Post): void {
    if (!this.currentUser) {
      return;
    }

    this.postService.interactWithPost({ postId: post.id, type: 'like' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPost) => {
          const index = this.posts.findIndex(p => p.id === post.id);
          if (index !== -1) {
            this.posts[index] = updatedPost;
            this.filterPosts();
          }
        },
        error: (error) => {
          console.error('Error liking post:', error);
        }
      });
  }

  dislikePost(post: Post): void {
    if (!this.currentUser) {
      return;
    }

    this.postService.interactWithPost({ postId: post.id, type: 'dislike' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPost) => {
          const index = this.posts.findIndex(p => p.id === post.id);
          if (index !== -1) {
            this.posts[index] = updatedPost;
            this.filterPosts();
          }
        },
        error: (error) => {
          console.error('Error disliking post:', error);
        }
      });
  }

  retryLoad(): void {
    this.loadPosts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filteredPosts = this.posts;
  }

  trackByPostId(index: number, post: Post): string {
    return post.id;
  }
}
