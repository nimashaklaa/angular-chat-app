import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoChatService } from './services/video-chat.service';
import { AuthService } from './services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoChatComponent } from './video-chat/video-chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'client';

  private signalRService = inject(VideoChatService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private ringingAudio?: HTMLAudioElement;

  ngOnInit(): void {
    if (!this.authService.getExistingToken) return;
    this.signalRService.startConnection();
    this.startOfferReceive();
    this.setupRingingListener();
  }

  startOfferReceive() {
    this.signalRService.offerReceived.subscribe(async data => {
      if (data) {
        // Play ringing tone
        this.ringingAudio = new Audio('/assets/ringing-tone.mp3');
        this.ringingAudio.loop = true; // Loop the ringing
        this.ringingAudio.play();

        // Open video chat dialog
        const dialogRef = this.dialog.open(VideoChatComponent, {
          width: '400px',
          height: '600px',
          disableClose: false,
        });

        // Stop ringing when dialog closes (call answered/declined/ended)
        dialogRef.afterClosed().subscribe(() => {
          this.stopRinging();
        });

        this.signalRService.remoteUserId = data.senderId;
        this.signalRService.incomingCall = true;
      }
    });
  }

  private setupRingingListener() {
    this.signalRService.shouldStopRinging.subscribe(shouldStop => {
      if (shouldStop) {
        this.stopRinging();
        this.signalRService.shouldStopRinging.next(false);
      }
    });
  }

  private stopRinging() {
    if (this.ringingAudio) {
      this.ringingAudio.pause();
      this.ringingAudio.currentTime = 0;
      this.ringingAudio = undefined;
    }
  }
}
