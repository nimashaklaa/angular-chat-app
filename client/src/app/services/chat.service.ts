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

  constructor() {
    // Preload audio on service initialization
    this.notificationAudio = new Audio('/assets/notification.mp3');
    this.notificationAudio.volume = 0.5;
    this.notificationAudio.load();
  }

  // A reactive list of users who are currently online. When this updates, Angular automatically updates the UI.
  onlineUsers = signal<User[]>([]);

  currentOpenedChat = signal<User | null>(null);

  chatMessages = signal<Message[]>([]);

  isLoading = signal<boolean>(true);

  isLoadingMore = signal<boolean>(false);

  currentPage = signal<number>(1);

  // The connection object to the SignalR server
  private hubConnection?: HubConnection;

  // Preload notification audio
  private notificationAudio: HTMLAudioElement;

  // Sends the token with every request (accessTokenFactory)
  startConnection(token: string, senderId?: string) {
    if (this.hubConnection?.state === HubConnectionState.Connected) return;

    if (this.hubConnection) {
      this.hubConnection.off('ReceiveMessage');
      this.hubConnection.off('RecieveMessageList');
      this.hubConnection.off('OnlineUsers');
      this.hubConnection.off('NotifyTypingToUser');
      this.hubConnection.off('Notify');
    }
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    // Register event handlers BEFORE starting connection
    this.registerEventHandlers();

    this.hubConnection
      .start()
      .then(() => {
        // Request notification permission when connection is established
        this.requestNotificationPermission();
      })
      .catch(error => {
        console.error('Connection error:', error);
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
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Active now 🟢', {
          body: `${user.fullName} is online now`,
          icon: user.profileImage,
        });
      }
    });

    // Listen for online users list updates
    this.hubConnection!.on('OnlineUsers', (user: User[]) => {
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
    this.hubConnection!.on('RecieveMessageList', (newMessages: Message[]) => {
      this.chatMessages.update(existingMessages => {
        // Get existing message IDs
        const existingIds = new Set(existingMessages.map(m => m.id));

        // Filter out duplicates from new messages
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));

        // Prepend unique new messages
        return [...uniqueNewMessages, ...existingMessages];
      });

      this.isLoading.update(() => false);
      this.isLoadingMore.update(() => false);
    });

    // Listen for new incoming messages (event name must match backend: "ReceiveMessage")
    this.hubConnection!.on('ReceiveMessage', (message: Message) => {
      // Only play sound and update title if message is from someone else
      if (message.senderId !== this.authService.currentLoggedInUser?.id) {
        this.playNotificationSound();
        document.title = '(1) New Message';
      }

      // Replace temporary message with real one if it exists
      this.chatMessages.update(messages => {
        const tempMessageIndex = messages.findIndex(
          m =>
            m.id < 0 &&
            m.content === message.content &&
            m.senderId === message.senderId &&
            m.receiverId === message.receiverId
        );

        if (tempMessageIndex !== -1) {
          // Replace temp message with real one
          const updated = [...messages];
          updated[tempMessageIndex] = message;
          return updated;
        } else {
          // No temp message found, just add the new message
          return [...messages, message];
        }
      });
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
    if (pageNumber === 1) {
      this.isLoading.update(() => true);
    } else {
      this.isLoadingMore.update(() => true);
    }
    this.currentPage.set(pageNumber);
    this.hubConnection
      ?.invoke('LoadMessages', this.currentOpenedChat()?.id, pageNumber)
      .then()
      .catch()
      .finally(() => {
        this.isLoading.update(() => false);
        this.isLoadingMore.update(() => false);
      });
  }

  loadMoreMessages() {
    const nextPage = this.currentPage() + 1;
    this.loadMessages(nextPage);
  }

  resetChat() {
    this.chatMessages.set([]);
    this.currentPage.set(1);
    this.isLoading.set(true);
    this.isLoadingMore.set(false);
  }

  sendMessage(message: string) {
    // Enable notification sound on first user interaction
    this.enableNotificationSound();

    // Generate a temporary negative ID for optimistic update
    const tempId = -Date.now();

    this.chatMessages.update(messages => [
      ...messages,
      {
        content: message,
        senderId: this.authService.currentLoggedInUser!.id,
        receiverId: this.currentOpenedChat()!.id,
        timestamp: new Date().toString(),
        isRead: false,
        id: tempId, // Temporary ID (negative)
      },
    ]);

    this.hubConnection
      ?.invoke('SendMessage', {
        receiverId: this.currentOpenedChat()?.id,
        content: message,
      })
      .then(() => {
        // Temp message will be replaced by ReceiveNewMessage handler
      })
      .catch(error => {
        console.log('error', error);
        // Remove temporary message on error
        this.chatMessages.update(messages => messages.filter(m => m.id !== tempId));
      });
  }

  notifyTyping() {
    this.hubConnection!.invoke('NotifyTyping', this.currentOpenedChat()?.userName)
      .then(() => {
        // Typing notification sent successfully
      })
      .catch(error => console.error('Error sending typing notification:', error));
  }

  private playNotificationSound() {
    try {
      // Reset audio to start
      this.notificationAudio.currentTime = 0;

      // Attempt to play
      const playPromise = this.notificationAudio.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Could not play notification sound:', error.message);
        });
      }
    } catch (error) {
      console.error('Error playing notification audio:', error);
    }
  }

  // Call this method after user interacts with the app to enable autoplay
  enableNotificationSound() {
    this.notificationAudio
      .play()
      .then(() => {
        this.notificationAudio.pause();
        this.notificationAudio.currentTime = 0;
      })
      .catch(() => {
        // Failed to enable notification sound
      });
  }
}
