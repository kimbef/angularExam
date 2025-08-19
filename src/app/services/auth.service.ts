import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, from, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.interface';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {
    this.initAuthListener();
  }

  private initAuthListener(): void {
    const auth = this.firebaseService.getAuth();
    onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        try {
          const user = await this.createUserFromFirebaseUser(firebaseUser);
          const token = await firebaseUser.getIdToken();
          console.log('User data loaded:', user);
          this.currentUserSubject.next(user);
          this.tokenSubject.next(token);
        } catch (error) {
          console.error('Error loading user data:', error);
          this.currentUserSubject.next(null);
          this.tokenSubject.next(null);
        }
      } else {
        this.currentUserSubject.next(null);
        this.tokenSubject.next(null);
      }
    });
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const auth = this.firebaseService.getAuth();
    return from(signInWithEmailAndPassword(auth, credentials.email, credentials.password)).pipe(
      switchMap(async (userCredential: UserCredential) => {
        const user = await this.createUserFromFirebaseUser(userCredential.user);
        const token = await userCredential.user.getIdToken();
        const authResponse: AuthResponse = {
          user,
          token,
          refreshToken: token // Using the same token for simplicity
        };
        return authResponse;
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    const auth = this.firebaseService.getAuth();
    const database = this.firebaseService.getDatabase();
    
    return from(createUserWithEmailAndPassword(auth, userData.email, userData.password)).pipe(
      switchMap(async (userCredential: UserCredential) => {
        // Update the user's display name
        await updateProfile(userCredential.user, {
          displayName: `${userData.firstName} ${userData.lastName}`
        });

        const user: User = {
          id: userCredential.user.uid,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Save user data to Realtime Database
        await set(ref(database, `users/${userCredential.user.uid}`), {
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: user.avatar,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        });

        const token = await userCredential.user.getIdToken();
        const authResponse: AuthResponse = {
          user,
          token,
          refreshToken: token
        };
        return authResponse;
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<void> {
    const auth = this.firebaseService.getAuth();
    return from(signOut(auth)).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.tokenSubject.next(null);
      }),
      catchError(this.handleError)
    );
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private async createUserFromFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
    const database = this.firebaseService.getDatabase();
    const userRef = ref(database, `users/${firebaseUser.uid}`);
    
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: userData.username || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt)
        };
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // Fallback if user data doesn't exist in database
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      firstName: firebaseUser.displayName?.split(' ')[0] || '',
      lastName: firebaseUser.displayName?.split(' ')[1] || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        default:
          errorMessage = error.message || 'Authentication failed.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
