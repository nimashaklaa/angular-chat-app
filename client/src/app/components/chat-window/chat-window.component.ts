import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-window',
  imports: [TitleCasePipe, MatIconModule, FormsModule],
  templateUrl: './chat-window.component.html',
  styles: ``,
})
export class ChatWindowComponent {
  chatService = inject(ChatService);
  message: string = '';

  sendMessage() {}
}
