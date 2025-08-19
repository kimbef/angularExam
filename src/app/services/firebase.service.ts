import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebase);
  private auth: Auth = getAuth(this.app);
  private database: Database = getDatabase(this.app);

  constructor() {}

  getAuth(): Auth {
    return this.auth;
  }

  getDatabase(): Database {
    return this.database;
  }
}
