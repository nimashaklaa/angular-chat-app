import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { CallHistory } from '../Models/call-history';
import { ApiResponse } from '../Models/api-response';

@Injectable({
  providedIn: 'root',
})
export class CallHistoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'http://localhost:5001/api/call-history';

  callHistory = signal<CallHistory[]>([]);
  isLoading = signal<boolean>(false);

  getCallHistory() {
    this.isLoading.set(true);
    const token = this.authService.getExistingToken;
    
    this.http
      .get<ApiResponse<CallHistory[]>>(this.baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: (response: any) => {
          if (response.isSuccess || response.success) {
            this.callHistory.set(response.data || []);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching call history:', error);
          this.isLoading.set(false);
        },
      });
  }

  getCallHistoryWithUser(userId: string) {
    this.isLoading.set(true);
    const token = this.authService.getExistingToken;
    
    this.http
      .get<ApiResponse<CallHistory[]>>(`${this.baseUrl}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: (response: any) => {
          if (response.isSuccess || response.success) {
            this.callHistory.set(response.data || []);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching call history:', error);
          this.isLoading.set(false);
        },
      });
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  formatCallTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }
}

