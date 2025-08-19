import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.interface';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post: Post | null = null;
  currentUser: User | null = null;
  isLoading = true;
  error: string | null = null;
  newComment = '';
  isSubmittingComment = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.route.paramMap
      .pipe(
        switchMap(params => {
          const postId = params.get('id');
          if (!postId) {
            this.router.navigate(['/posts']);
            return [];
          }
          return this.postService.getPostById(postId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (post) => {
          this.post = post;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load post. Please try again later.';
          this.isLoading = false;
          console.error('Error loading post:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  likePost(): void {
    if (!this.currentUser || !this.post) {
      return;
    }

    this.postService.interactWithPost({ postId: this.post.id, type: 'like' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPost) => {
          this.post = updatedPost;
        },
        error: (error) => {
          console.error('Error liking post:', error);
        }
      });
  }

  dislikePost(): void {
    if (!this.currentUser || !this.post) {
      return;
    }

    this.postService.interactWithPost({ postId: this.post.id, type: 'dislike' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPost) => {
          this.post = updatedPost;
        },
        error: (error) => {
          console.error('Error disliking post:', error);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }

  sharePost(platform: string): void {
    if (!this.post) return;
    
    const url = window.location.href;
    const title = this.post.title;
    
    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
        break;
      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          // You could add a toast notification here
          console.log('Link copied to clipboard');
        });
        break;
    }
  }

  submitComment(): void {
    if (!this.currentUser || !this.post || !this.newComment.trim()) {
      return;
    }

    this.isSubmittingComment = true;
    
    this.postService.addComment(this.post.id, this.newComment.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPost) => {
          this.post = updatedPost;
          this.newComment = '';
          this.isSubmittingComment = false;
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.isSubmittingComment = false;
        }
      });
  }

  retryLoad(): void {
    this.isLoading = true;
    this.error = null;
    this.ngOnInit();
  }
}
