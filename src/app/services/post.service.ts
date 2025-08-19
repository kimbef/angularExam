import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, from, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { ref, push, set, get, remove, onValue, off, query, orderByChild, equalTo, update } from 'firebase/database';
import { Post, CreatePostRequest, UpdatePostRequest, PostInteraction, Comment } from '../models/post.interface';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postsSubject = new BehaviorSubject<Post[]>([]);
  private userPostsSubject = new BehaviorSubject<Post[]>([]);
  private allPostsListener: any = null;
  private userPostsListener: any = null;

  public posts$ = this.postsSubject.asObservable();
  public userPosts$ = this.userPostsSubject.asObservable();

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {
    this.initializeListeners();
  }

  private initializeListeners(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.setupAllPostsListener();
        this.setupUserPostsListener(user.id);
      } else {
        this.removeListeners();
      }
    });
  }

  private setupAllPostsListener(): void {
    const database = this.firebaseService.getDatabase();
    const postsRef = ref(database, 'all-posts');
    
    this.allPostsListener = onValue(postsRef, (snapshot) => {
      const posts: Post[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          const post = this.transformFirebasePost(key, data[key]);
          if (post.isPublished) {
            posts.push(post);
          }
        });
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      this.postsSubject.next(posts);
    });
  }

  private setupUserPostsListener(userId: string): void {
    const database = this.firebaseService.getDatabase();
    const userPostsRef = ref(database, `my-posts/${userId}`);
    
    this.userPostsListener = onValue(userPostsRef, async (snapshot) => {
      const posts: Post[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Process each post and sync with all-posts if published
        for (const key of Object.keys(data)) {
          let postData = data[key];
          
          // If post is published, get the latest data from all-posts
          if (postData.isPublished) {
            try {
              const allPostRef = ref(database, `all-posts/${key}`);
              const allPostSnapshot = await get(allPostRef);
              if (allPostSnapshot.exists()) {
                const allPostData = allPostSnapshot.val();
                // Merge the data, prioritizing interaction counts from all-posts
                postData = {
                  ...postData,
                  likes: allPostData.likes || 0,
                  dislikes: allPostData.dislikes || 0,
                  likedBy: allPostData.likedBy || [],
                  dislikedBy: allPostData.dislikedBy || [],
                  comments: allPostData.comments || []
                };
              }
            } catch (error) {
              console.warn('Could not sync post data from all-posts:', error);
            }
          }
          
          posts.push(this.transformFirebasePost(key, postData));
        }
        
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      this.userPostsSubject.next(posts);
    });
  }

  private removeListeners(): void {
    if (this.allPostsListener) {
      off(ref(this.firebaseService.getDatabase(), 'all-posts'), 'value', this.allPostsListener);
      this.allPostsListener = null;
    }
    if (this.userPostsListener) {
      off(ref(this.firebaseService.getDatabase(), 'my-posts'), 'value', this.userPostsListener);
      this.userPostsListener = null;
    }
    this.postsSubject.next([]);
    this.userPostsSubject.next([]);
  }

  getAllPosts(): Observable<Post[]> {
    return this.posts$;
  }

  getPostById(id: string): Observable<Post> {
    const database = this.firebaseService.getDatabase();
    const postRef = ref(database, `all-posts/${id}`);
    
    return from(get(postRef)).pipe(
      switchMap(snapshot => {
        if (snapshot.exists()) {
          // Post found in all-posts (published post)
          return of(this.transformFirebasePost(id, snapshot.val()));
        }
        
        // Post not found in all-posts, check if it's a draft in my-posts
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('Post not found');
        }
        
        const userPostRef = ref(database, `my-posts/${currentUser.id}/${id}`);
        return from(get(userPostRef)).pipe(
          map(userSnapshot => {
            if (userSnapshot.exists()) {
              return this.transformFirebasePost(id, userSnapshot.val());
            }
            throw new Error('Post not found');
          })
        );
      }),
      catchError(this.handleError)
    );
  }

  getUserPosts(): Observable<Post[]> {
    return this.userPosts$;
  }

  createPost(postData: CreatePostRequest): Observable<Post> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const database = this.firebaseService.getDatabase();
    const newPost: Omit<Post, 'id'> = {
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
      likedBy: [],
      dislikedBy: [],
      comments: [],
      imageUrl: postData.imageUrl,
      isPublished: postData.isPublished,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create post in user's posts
    const userPostsRef = ref(database, `my-posts/${currentUser.id}`);
    const newUserPostRef = push(userPostsRef);
    const postId = newUserPostRef.key!;

    const postWithId: Post = { ...newPost, id: postId };
    
    return from(set(newUserPostRef, this.transformPostForFirebase(postWithId))).pipe(
      switchMap(() => {
        // If published, also add to all-posts
        if (postData.isPublished) {
          const allPostsRef = ref(database, `all-posts/${postId}`);
          return from(set(allPostsRef, this.transformPostForFirebase(postWithId)));
        }
        return from(Promise.resolve());
      }),
      map(() => postWithId),
      catchError(this.handleError)
    );
  }

  updatePost(postData: UpdatePostRequest): Observable<Post> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const database = this.firebaseService.getDatabase();
    const userPostRef = ref(database, `my-posts/${currentUser.id}/${postData.id}`);
    
    return from(get(userPostRef)).pipe(
      switchMap(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Post not found');
        }

        const existingPost = this.transformFirebasePost(postData.id!, snapshot.val());
        const updatedPost: Post = {
          ...existingPost,
          ...postData,
          updatedAt: new Date()
        };

        const updateData = this.transformPostForFirebase(updatedPost);
        
        // Update in user's posts
        return from(set(userPostRef, updateData)).pipe(
          switchMap(() => {
            // If published, also update in all-posts
            if (updatedPost.isPublished) {
              const allPostRef = ref(database, `all-posts/${postData.id}`);
              return from(set(allPostRef, updateData));
            } else {
              // If unpublished, remove from all-posts
              const allPostRef = ref(database, `all-posts/${postData.id}`);
              return from(remove(allPostRef));
            }
          }),
          map(() => updatedPost)
        );
      }),
      catchError(this.handleError)
    );
  }

  deletePost(postId: string): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const database = this.firebaseService.getDatabase();
    const userPostRef = ref(database, `my-posts/${currentUser.id}/${postId}`);
    const allPostRef = ref(database, `all-posts/${postId}`);

    return from(remove(userPostRef)).pipe(
      switchMap(() => from(remove(allPostRef))),
      catchError(this.handleError)
    );
  }

  interactWithPost(interaction: PostInteraction): Observable<Post> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const database = this.firebaseService.getDatabase();
    const postRef = ref(database, `all-posts/${interaction.postId}`);
    
    return from(get(postRef)).pipe(
      switchMap(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Post not found');
        }

        const existingPost = this.transformFirebasePost(interaction.postId, snapshot.val());
        
        // Check if user has already interacted
        const hasLiked = existingPost.likedBy.includes(currentUser.id);
        const hasDisliked = existingPost.dislikedBy.includes(currentUser.id);
        
        let updatedLikedBy = [...existingPost.likedBy];
        let updatedDislikedBy = [...existingPost.dislikedBy];
        
        if (interaction.type === 'like') {
          if (hasLiked) {
            // Remove like
            updatedLikedBy = updatedLikedBy.filter(id => id !== currentUser.id);
          } else {
            // Add like and remove dislike if exists
            updatedLikedBy.push(currentUser.id);
            updatedDislikedBy = updatedDislikedBy.filter(id => id !== currentUser.id);
          }
        } else {
          if (hasDisliked) {
            // Remove dislike
            updatedDislikedBy = updatedDislikedBy.filter(id => id !== currentUser.id);
          } else {
            // Add dislike and remove like if exists
            updatedDislikedBy.push(currentUser.id);
            updatedLikedBy = updatedLikedBy.filter(id => id !== currentUser.id);
          }
        }

        const updatedPost: Post = {
          ...existingPost,
          likes: updatedLikedBy.length,
          dislikes: updatedDislikedBy.length,
          likedBy: updatedLikedBy,
          dislikedBy: updatedDislikedBy,
          updatedAt: new Date()
        };

        const updateData = {
          likes: updatedPost.likes,
          dislikes: updatedPost.dislikes,
          likedBy: updatedPost.likedBy,
          dislikedBy: updatedPost.dislikedBy,
          updatedAt: updatedPost.updatedAt.toISOString()
        };

        return from(update(postRef, updateData)).pipe(
          switchMap(() => {
            // Also update the post in the author's my-posts collection
            const authorId = existingPost.author.id;
            const userPostRef = ref(database, `my-posts/${authorId}/${interaction.postId}`);
            return from(update(userPostRef, updateData));
          }),
          map(() => updatedPost)
        );
      }),
      catchError(this.handleError)
    );
  }

  addComment(postId: string, content: string): Observable<Post> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const database = this.firebaseService.getDatabase();
    const postRef = ref(database, `all-posts/${postId}`);
    
    return from(get(postRef)).pipe(
      switchMap(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Post not found');
        }

        const existingPost = this.transformFirebasePost(postId, snapshot.val());
        
        const newComment: Comment = {
          id: push(ref(database, 'temp')).key!,
          content: content,
          author: {
            id: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`
          },
          postId: postId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const updatedComments = [...existingPost.comments, newComment];
        const updatedPost: Post = {
          ...existingPost,
          comments: updatedComments,
          updatedAt: new Date()
        };

        const updateData = {
          comments: updatedComments.map(comment => ({
            id: comment.id,
            content: comment.content,
            author: comment.author,
            postId: comment.postId,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
          })),
          updatedAt: updatedPost.updatedAt.toISOString()
        };

        return from(update(postRef, updateData)).pipe(
          map(() => updatedPost)
        );
      }),
      catchError(this.handleError)
    );
  }

  canUserEditPost(post: Post): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.id === post.author.id : false;
  }

  publishPost(postId: string): Observable<Post> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const database = this.firebaseService.getDatabase();
    const userPostRef = ref(database, `my-posts/${currentUser.id}/${postId}`);
    
    return from(get(userPostRef)).pipe(
      switchMap(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Draft post not found');
        }

        const draftPost = this.transformFirebasePost(postId, snapshot.val());
        
        // Ensure the current user is the author
        if (draftPost.author.id !== currentUser.id) {
          throw new Error('Not authorized to publish this post');
        }

        // Update the draft to published
        const publishedPost: Post = {
          ...draftPost,
          isPublished: true,
          updatedAt: new Date()
        };

        const postData = this.transformPostForFirebase(publishedPost);

        // Update in user's my-posts
        const userPostUpdate = from(update(userPostRef, { 
          isPublished: true, 
          updatedAt: publishedPost.updatedAt.toISOString() 
        }));

        // Add to all-posts
        const allPostsRef = ref(database, `all-posts/${postId}`);
        const allPostsUpdate = from(set(allPostsRef, postData));

        // Execute both updates
        return from(Promise.all([userPostUpdate, allPostsUpdate])).pipe(
          map(() => publishedPost)
        );
      }),
      catchError(this.handleError)
    );
  }

  private transformFirebasePost(id: string, firebaseData: any): Post {
    return {
      id,
      title: firebaseData.title,
      content: firebaseData.content,
      excerpt: firebaseData.excerpt,
      author: firebaseData.author,
      category: firebaseData.category,
      tags: firebaseData.tags || [],
      likes: firebaseData.likes || 0,
      dislikes: firebaseData.dislikes || 0,
      likedBy: firebaseData.likedBy || [],
      dislikedBy: firebaseData.dislikedBy || [],
      comments: (firebaseData.comments || []).map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        updatedAt: new Date(comment.updatedAt)
      })),
      imageUrl: firebaseData.imageUrl,
      isPublished: firebaseData.isPublished,
      createdAt: new Date(firebaseData.createdAt),
      updatedAt: new Date(firebaseData.updatedAt)
    };
  }

  private transformPostForFirebase(post: Post): any {
    return {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      category: post.category,
      tags: post.tags,
      likes: post.likes,
      dislikes: post.dislikes,
      likedBy: post.likedBy,
      dislikedBy: post.dislikedBy,
      comments: post.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        postId: comment.postId,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      })),
      imageUrl: post.imageUrl,
      isPublished: post.isPublished,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          errorMessage = 'Permission denied. Please check your access rights.';
          break;
        case 'network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message || 'Database operation failed.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
