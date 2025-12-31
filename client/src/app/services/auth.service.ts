import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ApiResponse } from '../Models/api-response';
import { Observable, tap } from 'rxjs';
import { User } from '../Models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5001/api/account';
  private token = 'token';
  isLoading = signal(false);

  private httpClient = inject(HttpClient);

  register(data: FormData): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(`${this.baseUrl}/register`, data).pipe(
      tap(response => {
        localStorage.setItem(this.token, response.data);
      })
    );
  }

  login(data: { email: string; password: string }): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(`${this.baseUrl}/login`, data).pipe(
      tap(response => {
        if (response.isSuccess) {
          localStorage.setItem(this.token, response.data);
        }
        return response;
      })
    );
  }
  profile(): Observable<ApiResponse<User>> {
    return this.httpClient
      .get<ApiResponse<User>>(`${this.baseUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${this.getExistingToken}`,
        },
      })
      .pipe(
        tap(response => {
          if (response.isSuccess) {
            localStorage.setItem('user', JSON.stringify(response.data));
          }
          return response;
        })
      );
  }

  get getExistingToken(): string | null {
    return localStorage.getItem(this.token) || '';
  }

  isLoggedIn(): boolean {
    return !!this.getExistingToken;
  }

  logout() {
    localStorage.removeItem(this.token);
    localStorage.removeItem('user');
  }

  get currentLoggedInUser(): User | null {
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');
    return user;
  }
}
