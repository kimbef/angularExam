import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Post, CreatePostRequest, UpdatePostRequest, PostInteraction, Comment } from '../models/post.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = 'https://jsonplaceholder.typicode.com';
  private postsSubject = new BehaviorSubject<Post[]>([]);
  private userPostsSubject = new BehaviorSubject<Post[]>([]);

  public posts$ = this.postsSubject.asObservable();
  public userPosts$ = this.userPostsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllPosts(): Observable<Post[]> {
    return this.http.get<any[]>(`${this.API_URL}/posts`).pipe(
      switchMap(posts => 
        this.http.get<any[]>(`${this.API_URL}/users`).pipe(
          map(users => {
            const userMap = new Map(users.map(user => [user.id, user]));
            
            return posts.slice(0, 20).map(post => this.transformToPost(post, userMap.get(post.userId)));
          })
        )
      ),
      tap(posts => this.postsSubject.next(posts)),
      catchError(this.handleError)
    );
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<any>(`${this.API_URL}/posts/${id}`).pipe(
      switchMap(post => 
        this.http.get<any>(`${this.API_URL}/users/${post.userId}`).pipe(
          switchMap(user => 
            this.http.get<any[]>(`${this.API_URL}/posts/${id}/comments`).pipe(
              map(comments => {
                const transformedPost = this.transformToPost(post, user);
                transformedPost.comments = comments.map(comment => this.transformToComment(comment));
                return transformedPost;
              })
            )
          )
        )
      ),
      catchError(this.handleError)
    );
  }

  getUserPosts(): Observable<Post[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Mock user posts - in real app, filter by actual user ID
    return this.http.get<any[]>(`${this.API_URL}/posts`).pipe(
      switchMap(posts => 
        this.http.get<any[]>(`${this.API_URL}/users`).pipe(
          map(users => {
            const userMap = new Map(users.map(user => [user.id, user]));
            
            // Mock: take first 5 posts as user's posts
            return posts.slice(0, 5).map(post => {
              const transformedPost = this.transformToPost(post, userMap.get(post.userId));
              // Override author to be current user
              transformedPost.author = {
                id: currentUser.id,
                username: currentUser.username,
                avatar: currentUser.avatar
              };
              return transformedPost;
            });
          })
        )
      ),
      tap(posts => this.userPostsSubject.next(posts)),
      catchError(this.handleError)
    );
  }

  createPost(postData: CreatePostRequest): Observable<Post> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Mock creation - in real app, this would POST to your backend
    const mockPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar
      },
      category: postData.category,
      tags: postData.tags,
      likes: 0,
      dislikes: 0,
      comments: [],
      imageUrl: postData.imageUrl,
      isPublished: postData.isPublished,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update local state
    const currentPosts = this.userPostsSubject.value;
    this.userPostsSubject.next([mockPost, ...currentPosts]);

    return new Observable(observer => {
      observer.next(mockPost);
      observer.complete();
    });
  }

  updatePost(postData: UpdatePostRequest): Observable<Post> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const currentPosts = this.userPostsSubject.value;
    const postIndex = currentPosts.findIndex(p => p.id === postData.id);
    
    if (postIndex === -1) {
      return throwError(() => new Error('Post not found'));
    }

    const updatedPost = {
      ...currentPosts[postIndex],
      ...postData,
      updatedAt: new Date()
    };

    const updatedPosts = [...currentPosts];
    updatedPosts[postIndex] = updatedPost;
    this.userPostsSubject.next(updatedPosts);

    return new Observable(observer => {
      observer.next(updatedPost);
      observer.complete();
    });
  }

  deletePost(postId: string): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const currentPosts = this.userPostsSubject.value;
    const filteredPosts = currentPosts.filter(p => p.id !== postId);
    this.userPostsSubject.next(filteredPosts);

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  interactWithPost(interaction: PostInteraction): Observable<Post> {
    // Mock interaction - in real app, this would call your backend
    const allPosts = this.postsSubject.value;
    const postIndex = allPosts.findIndex(p => p.id === interaction.postId);
    
    if (postIndex === -1) {
      return throwError(() => new Error('Post not found'));
    }

    const updatedPost = { ...allPosts[postIndex] };
    if (interaction.type === 'like') {
      updatedPost.likes += 1;
    } else {
      updatedPost.dislikes += 1;
    }

    const updatedPosts = [...allPosts];
    updatedPosts[postIndex] = updatedPost;
    this.postsSubject.next(updatedPosts);

    return new Observable(observer => {
      observer.next(updatedPost);
      observer.complete();
    });
  }

  private transformToPost(apiPost: any, apiUser: any): Post {
    return {
      id: apiPost.id.toString(),
      title: apiPost.title,
      content: apiPost.body,
      excerpt: apiPost.body.substring(0, 150) + '...',
      author: {
        id: apiUser.id.toString(),
        username: apiUser.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.username}`
      },
      category: 'General',
      tags: ['blog', 'post'],
      likes: Math.floor(Math.random() * 50),
      dislikes: Math.floor(Math.random() * 10),
      comments: [],
      imageUrl: `https://picsum.photos/400/200?random=${apiPost.id}`,
      isPublished: true,
      createdAt: new Date(Date.now() - Math.random() * 10000000000),
      updatedAt: new Date()
    };
  }

  private transformToComment(apiComment: any): Comment {
    return {
      id: apiComment.id.toString(),
      content: apiComment.body,
      author: {
        id: Math.random().toString(36).substr(2, 9),
        username: apiComment.name.split(' ')[0].toLowerCase(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiComment.name}`
      },
      postId: apiComment.postId.toString(),
      createdAt: new Date(Date.now() - Math.random() * 1000000000),
      updatedAt: new Date()
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
