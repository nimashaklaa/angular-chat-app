import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinner, DatePipe],
  templateUrl: './chat-box.component.html',
  styles: ``,
})
export class ChatBoxComponent {
  chatService = inject(ChatService);
  authService = inject(AuthService);
}
