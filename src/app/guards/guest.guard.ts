import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, switchMap, filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { FirebaseService } from '../services/firebase.service';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    const auth = this.firebaseService.getAuth();
    
    // Wait for Firebase auth state to be initialized
    return new Observable<boolean>(observer => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        unsubscribe(); // Unsubscribe after first auth state check
        
        if (!firebaseUser) {
          // No user logged in, allow access to login/register
          observer.next(true);
          observer.complete();
        } else {
          // User is logged in, redirect to dashboard
          this.router.navigate(['/dashboard']);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
