import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../Models/api-response';
import { Observable, tap } from 'rxjs';
import { User } from '../Models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:5001/api/account';
  private token = "token"

  private httpClient = inject(HttpClient);

  register(data:FormData):Observable<ApiResponse<string>>{
    return this.httpClient.post<ApiResponse<string>>(`${this.baseUrl}/register`, data)
    .pipe(tap(response => {
      localStorage.setItem(this.token, response.data);
    }));
  }

  login(data:{email:string, password:string}):Observable<ApiResponse<string>>{
    return this.httpClient.post<ApiResponse<string>>(`${this.baseUrl}/login`, data)
    .pipe(tap(response => {
      if (response.isSuccess){
        localStorage.setItem(this.token, response.data);
      }
      return response;
    }));
  }
  profile():Observable<ApiResponse<User>>{
    return this.httpClient.get<ApiResponse<User>>(`${this.baseUrl}/profile`)
    .pipe(tap(response => {
      if(response.isSuccess){
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response;
    }));
  }

}
