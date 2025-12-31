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
        // Stop any existing ringing first
        this.stopRinging();
        
        // Set call type from received offer
        this.signalRService.callType = data.callType;
        
        // Prepare ringing tone (but don't play yet due to browser autoplay policy)
        this.ringingAudio = new Audio('/assets/ringing-tone.mp3');
        this.ringingAudio.loop = true;
        this.ringingAudio.volume = 0.7;
        
        // Try to play, but handle autoplay policy gracefully
        this.ringingAudio.play().catch(err => {
          // Browser blocked autoplay - this is expected
          // We'll try to play when user interacts with the dialog
          console.log('Ringing tone will play when user interacts with the call dialog');
        });

        // Open video/voice chat dialog with appropriate size
        const dialogRef = this.dialog.open(VideoChatComponent, {
          width: data.callType === 'video' ? '400px' : '350px',
          height: data.callType === 'video' ? '600px' : '500px',
          disableClose: false,
        });

        // Try to play ringing when dialog opens (user interaction)
        dialogRef.afterOpened().subscribe(() => {
          if (this.ringingAudio && this.ringingAudio.paused) {
            this.ringingAudio.play().catch(err => {
              // Still blocked, will play when user clicks accept/decline
              console.log('Ringing tone will play on button click');
            });
          }
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
    // Listen for stop ringing signal
    this.signalRService.shouldStopRinging.subscribe(shouldStop => {
      if (shouldStop) {
        this.stopRinging();
      }
    });
  }

  private stopRinging() {
    if (this.ringingAudio) {
      try {
        this.ringingAudio.pause();
        this.ringingAudio.currentTime = 0;
        this.ringingAudio.loop = false;
        this.ringingAudio.src = ''; // Clear the source
        this.ringingAudio.load(); // Reset the audio element
      } catch (error) {
        console.error('Error stopping ringing tone:', error);
      } finally {
        this.ringingAudio = undefined;
      }
    }
  }
}
