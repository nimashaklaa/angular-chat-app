import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { VideoChatService } from '../../services/video-chat.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoChatComponent } from '../../video-chat/video-chat.component';

@Component({
  selector: 'app-chat-window',
  imports: [TitleCasePipe, MatIconModule, FormsModule, ChatBoxComponent],
  templateUrl: './chat-window.component.html',
  styles: ``,
})
export class ChatWindowComponent {
  dialog = inject(MatDialog);
  chatService = inject(ChatService);
  signalRService = inject(VideoChatService);
  message: string = '';

  sendMessage() {
    if (!this.message) return;
    this.chatService.sendMessage(this.message);
    this.message = '';
  }
  displayDialog(receiverId: string, callType: 'video' | 'voice' = 'video') {
    this.signalRService.remoteUserId = receiverId;
    this.signalRService.callType = callType;
    this.dialog.open(VideoChatComponent, {
      width: callType === 'video' ? '400px' : '350px',
      height: callType === 'video' ? '600px' : '500px',
      disableClose: true,
      autoFocus: false,
    });
  }
}
