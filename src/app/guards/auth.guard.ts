import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { FirebaseService } from '../services/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    const auth = this.firebaseService.getAuth();
    
    // Wait for Firebase auth state to be initialized
    return new Observable<boolean>(observer => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        unsubscribe(); // Unsubscribe after first auth state check
        
        if (firebaseUser) {
          // User is logged in, allow access
          observer.next(true);
          observer.complete();
        } else {
          // No user logged in, redirect to login
          this.router.navigate(['/login']);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
