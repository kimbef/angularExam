import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, finalize } from 'rxjs/operators';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { UpdatePostRequest, Post } from '../../models/post.interface';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  post: Post | null = null;
  postForm: FormGroup;
  isLoading = true;
  isSaving = false;
  error: string | null = null;
  categories = ['General', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business'];
  availableTags = ['blog', 'tutorial', 'news', 'review', 'guide', 'tips', 'personal', 'tech', 'lifestyle'];
  selectedTags: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      excerpt: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(200)]],
      category: ['General', [Validators.required]],
      imageUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]],
      isPublished: [false]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (!user) {
          this.router.navigate(['/login']);
        }
      });

    // Load post data
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const postId = params.get('id');
          if (!postId) {
            this.router.navigate(['/my-posts']);
            return [];
          }
          return this.postService.getPostById(postId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (post) => {
          this.post = post;
          this.selectedTags = [...post.tags];
          this.postForm.patchValue({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            category: post.category,
            imageUrl: post.imageUrl,
            isPublished: post.isPublished
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load post. Please try again later.';
          this.isLoading = false;
          console.error('Error loading post:', error);
        }
      });

    // Clear errors when form values change
    this.postForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.error = null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.postForm.valid && !this.isSaving && this.post) {
      this.isSaving = true;
      this.error = null;

      const updateData: UpdatePostRequest = {
        id: this.post.id,
        ...this.postForm.value,
        tags: this.selectedTags
      };

      this.postService.updatePost(updateData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: (updatedPost) => {
            console.log('Post updated successfully:', updatedPost);
            this.router.navigate(['/my-posts']);
          },
          error: (error) => {
            console.error('Error updating post:', error);
            this.error = 'Failed to update post. Please try again.';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  generateRandomImage(): void {
    const randomId = Math.floor(Math.random() * 1000) + 1;
    const imageUrl = `https://picsum.photos/800/400?random=${randomId}`;
    this.postForm.patchValue({ imageUrl });
  }

  saveDraft(): void {
    if (this.postForm.get('title')?.value && this.postForm.get('content')?.value) {
      this.postForm.patchValue({ isPublished: false });
      this.onSubmit();
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.postForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors?.['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
      }
      if (field.errors?.['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be no more than ${field.errors?.['maxlength'].requiredLength} characters`;
      }
      if (field.errors?.['pattern']) {
        return 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)';
      }
    }
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      content: 'Content',
      excerpt: 'Excerpt',
      category: 'Category',
      imageUrl: 'Image URL'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach(key => {
      const control = this.postForm.get(key);
      control?.markAsTouched();
    });
  }
}
