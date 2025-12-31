import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../Models/user';
import { TitleCasePipe } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { TypingIndicatorComponent } from '../typing-indicator/typing-indicator.component';
import { CallHistoryComponent } from '../call-history/call-history.component';

@Component({
  selector: 'app-chat-sidebar',
  imports: [MatIcon, MatMenuModule, TitleCasePipe, TypingIndicatorComponent],
  templateUrl: './chat-sidebar.component.html',
  styles: ``,
})
export class ChatSidebarComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  chatService = inject(ChatService);
  dialog = inject(MatDialog);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.chatService.disConnectConnection();
  }

  ngOnInit(): void {
    this.chatService.startConnection(this.authService.getExistingToken!);
  }

  openChatWindow(user: User) {
    this.chatService.currentOpenedChat.set(user);
    this.chatService.resetChat(); // Clear messages and reset page number
    this.chatService.loadMessages(1);
    this.chatService.enableNotificationSound(); // Enable sound on user interaction
  }

  showCallHistory() {
    this.dialog.open(CallHistoryComponent, {
      width: '500px',
      height: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
    });
  }
}
