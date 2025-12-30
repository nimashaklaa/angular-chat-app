import { BootstrapOptions, inject, Injectable, signal } from '@angular/core';
import { User } from '../Models/user';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Message } from '../Models/message';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private authService = inject(AuthService);
  private hubUrl = 'http://localhost:5001/hubs/chat';

  // A reactive list of users who are currently online. When this updates, Angular automatically updates the UI.
  onlineUsers = signal<User[]>([]);

  currentOpenedChat = signal<User | null>(null);

  chatMessages = signal<Message[]>([]);

  isLoading = signal<boolean>(true);

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

    this.hubConnection!.on('RecieveMessageList', message => {
      this.chatMessages.update(messages => [...message, ...messages]);
      this.isLoading.update(() => false);
    });
  }

  disConnectConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }

  status(userName: string | undefined): string {
    const currentChatUser = this.currentOpenedChat();
    if (!currentChatUser) {
      return 'offline';
    }
    const onlineUser = this.onlineUsers().find(user => user.userName === userName);
    return onlineUser?.isTyping ? 'Typing ...' : this.isUserOnline();
  }

  isUserOnline(): string {
    let onlineUser = this.onlineUsers().find(
      user => user.userName === this.currentOpenedChat()?.userName
    );
    return onlineUser?.isOnline ? 'online' : this.currentOpenedChat()!.userName;
  }

  loadMessages(pageNumber:number){
    this.hubConnection?.invoke("LoadMessages", this.currentOpenedChat()?.id, pageNumber).then().catch().finally(()=>{
      this.isLoading.update(()=> false)
    })
  }
}
