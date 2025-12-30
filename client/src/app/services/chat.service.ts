import { inject, Injectable, signal } from '@angular/core';
import { User } from '../Models/user';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private authService = inject(AuthService);
  private hubUrl = 'http://localhost:5001/hubs/chat';

  // A reactive list of users who are currently online. When this updates, Angular automatically updates the UI.
  onlineUsers = signal<User[]>([]);

  // The connection object to the SignalR server
  private hubConnection?: HubConnection;

  // Sends the token with every request (accessTokenFactory)
  startConnection(token: string, senderId?: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
      })
      .catch(error => {
        console.log('Connection or login error', error);
      });

    this.hubConnection!.on('OnlineUsers', (user: User[]) => {
      console.log(user);
      this.onlineUsers.update(() =>
        user.filter(user => user.userName !== this.authService.currentLoggedInUser!.userName)
      );
    });
  }

  disConnectConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }
}
