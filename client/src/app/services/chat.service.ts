import { BootstrapOptions, inject, Injectable, signal } from '@angular/core';
import { User } from '../Models/user';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Message } from '../Models/message';
import { M } from '@angular/cdk/keycodes';

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

    // Register event handlers BEFORE starting connection
    this.registerEventHandlers();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
        // Request notification permission when connection is established
        this.requestNotificationPermission();
      })
      .catch(error => {
        console.log('Connection or login error', error);
      });
  }

  private requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }

  private registerEventHandlers() {
    // Listen for user coming online
    this.hubConnection!.on('Notify', (user: User) => {
      console.log('User came online:', user);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Active now 🟢', {
          body: `${user.fullName} is online now`,
          icon: user.profileImage,
        });
      }
    });

    // Listen for online users list updates
    this.hubConnection!.on('OnlineUsers', (user: User[]) => {
      console.log('Online users updated:', user);
      this.onlineUsers.update(() =>
        user.filter(u => u.userName !== this.authService.currentLoggedInUser!.userName)
      );
    });

    this.hubConnection!.on('NotifyTypingToUser', senderUserName => {
      this.onlineUsers.update(users =>
        users.map(user => {
          if (user.userName === senderUserName) {
            user.isTyping = true;
          }
          return user;
        })
      );
      setTimeout(() => {
        this.onlineUsers.update(users =>
          users.map(user => {
            if (user.userName === senderUserName) {
              user.isTyping = false;
            }
            return user;
          })
        );
      }, 2000);
    });

    // Listen for message list (history)
    this.hubConnection!.on('RecieveMessageList', message => {
      this.chatMessages.update(messages => [...message, ...messages]);
      this.isLoading.update(() => false);
    });

    // Listen for new incoming messages
    this.hubConnection!.on('ReceiveNewMessage', (message: Message) => {
      document.title = '(1) New Message';
      this.chatMessages.update(messages => [...messages, message]);
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

  loadMessages(pageNumber: number) {
    this.hubConnection
      ?.invoke('LoadMessages', this.currentOpenedChat()?.id, pageNumber)
      .then()
      .catch()
      .finally(() => {
        this.isLoading.update(() => false);
      });
  }

  sendMessage(message: string) {
    this.chatMessages.update(messages => [
      ...messages,
      {
        content: message,
        senderId: this.authService.currentLoggedInUser!.id,
        receiverId: this.currentOpenedChat()!.id,
        timestamp: new Date().toString(),
        isRead: false,
        id: 0,
      },
    ]);
    this.hubConnection
      ?.invoke('SendMessage', {
        receiverId: this.currentOpenedChat()?.id,
        content: message,
      })
      .then(message => {
        console.log('message', message);
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  notifyTyping(){
    this.hubConnection!.invoke('NotifyTyping', this.currentOpenedChat()?.userName)
    .then((x)=>console.log('notify for',x)
    ).catch((error)=>console.log(error)
    )
  }
}
