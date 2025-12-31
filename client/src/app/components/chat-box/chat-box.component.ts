import { Component, inject, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinner, DatePipe, MatIconModule],
  templateUrl: './chat-box.component.html',
  styles: [
    `
      .chat-box {
        scroll-behavior: smooth;
        padding: 10px;
        background-color: #f5f5f5;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        height: 100%;
        border-radius: 5px;
        overflow-y: auto;
      }
      .chat-box::-webkit-scrollbar {
        width: 8px;
      }
      .chat-box::-webkit-scrollbar-track {
        background-color: #f1f1f1;
        border-radius: 10px;
      }
      .chat-box::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }
      .chat-box::-webkit-scrollbar-thumb:hover {
        background: #555;
        border-radius: 10px;
      }
      .chat-icon {
        width: 40px;
        height: 40px;
        font-size: 48px;
      }
    `,
  ],
})
export class ChatBoxComponent implements AfterViewChecked {
  chatService = inject(ChatService);
  authService = inject(AuthService);

  @ViewChild('chatContainer') private chatContainer?: ElementRef;
  private shouldScroll = true;

  constructor() {
    // Watch for message changes and enable auto-scroll
    effect(() => {
      // React to messages signal changes
      this.chatService.chatMessages();
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll to bottom error:', err);
    }
  }

  loadMoreMessage() {
    this.shouldScroll = false; // Don't auto-scroll when loading more
    this.chatService.loadMoreMessages();
  }
}
