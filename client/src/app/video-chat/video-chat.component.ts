import { Component, ElementRef, inject, OnInit, ViewChild, Optional } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { VideoChatService } from '../services/video-chat.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-video-chat',
  imports: [MatIcon],
  template: `
    <div class="relative h-full w-full">
      @if (signalRService.callType === 'video') {
        <video
          class="w-32 absolute right-5 top-4 h-52 object-cover border-red-500 border-2 rounded-lg"
          #localVideo
          autoplay
          playInline
        ></video>
        <video
          class="w-full h-full object-cover bg-slate-800"
          #remoteVideo
          autoplay
          playsInline
        ></video>
      } @else {
        <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center">
          <div class="bg-white rounded-full p-8 mb-8">
            <mat-icon class="text-6xl text-blue-600">phone</mat-icon>
          </div>
          <div class="text-white text-2xl font-bold mb-2">
            {{ signalRService.isCalllActive ? 'Call in Progress' : 'Voice Call' }}
          </div>
          @if (signalRService.isCalllActive) {
            <div class="text-white text-sm opacity-80">
              Connected
            </div>
          }
          <!-- Hidden audio element for voice calls -->
          <audio #remoteAudio autoplay playsInline></audio>
        </div>
      }

      <div class="absolute bottom-10 left-0 right-0 z-50 flex justify-center space-x-3 p-4">
        @if (signalRService.incomingCall) {
          <button
            class="bg-green-500 flex items-center gap-2 hover:bg-green-600 shadow-xl text-white font-bold py-2 px-4 rounded-full"
            (click)="acceptCall()"
          >
            <mat-icon> call </mat-icon>
            Accept
          </button>
          <button
            class="bg-red-500 flex items-center gap-2 hover:bg-red-600 shadow-xl text-white font-bold py-2 px-4 rounded-full"
            (click)="declineCall()"
          >
            <mat-icon> call_end </mat-icon>
            Decline
          </button>
        }
        @if (!signalRService.incomingCall && !signalRService.isCalllActive) {
          <button
            class="bg-green-500 flex items-center gap-2 hover:bg-green-600 shadow-xl text-white font-bold py-2 px-4 rounded-full"
            (click)="startCall()"
          >
            <mat-icon> call </mat-icon>
            Start Call
          </button>
          <button
            class="bg-gray-500 flex items-center gap-2 hover:bg-gray-600 shadow-xl text-white font-bold py-2 px-4 rounded-full"
            (click)="closeDialog()"
            title="Close"
          >
            <mat-icon> close </mat-icon>
            Close
          </button>
        }
        @if (this.signalRService.isCalllActive) {
          <button
            class="bg-red-500 flex items-center gap-2 hover:bg-red-900 shadow-xl text-white font-bold py-2 px-4 rounded-full"
            (click)="endCall()"
          >
            <mat-icon> call_end </mat-icon>
            End Call
          </button>
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class VideoChatComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteAudio') remoteAudio!: ElementRef<HTMLAudioElement>;

  private peerConnection!: RTCPeerConnection;
  signalRService = inject(VideoChatService);
  private dialogRef: MatDialogRef<VideoChatComponent> = inject(MatDialogRef);
  private chatService = inject(ChatService, { optional: true });
  private iceCandidateQueue: RTCIceCandidate[] = [];

  async ngOnInit(): Promise<void> {
    this.setupPeerConnection();
    await this.startLocalMedia();
    // Ensure connection is started (might already be started from app.component)
    await this.signalRService.startConnection();
    this.setupSignalListers();
  }

  setupSignalListers() {
    this.signalRService.hubConnection.on('CallEnded', () => {
      this.handleRemoteCallEnd();
    });

    this.signalRService.answerReceived.subscribe(async data => {
      if (data) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        // Process queued ICE candidates after remote description is set
        await this.processIceCandidateQueue();
      }
    });

    this.signalRService.iceCandidateReceived.subscribe(async data => {
      if (data) {
        const candidate = new RTCIceCandidate(data.candidate);
        // Check if remote description is set before adding ICE candidate
        if (this.peerConnection.remoteDescription) {
          try {
            await this.peerConnection.addIceCandidate(candidate);
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        } else {
          // Queue the candidate if remote description is not set yet
          this.iceCandidateQueue.push(candidate);
        }
      }
    });

    // Update call type when offer is received
    this.signalRService.offerReceived.subscribe(data => {
      if (data) {
        this.signalRService.callType = data.callType;
      }
    });
  }

  declineCall() {
    // Stop ringing tone (user interaction allows us to control audio)
    this.signalRService.shouldStopRinging.next(true);
    
    // Store remoteUserId before clearing state
    const remoteUserId = this.signalRService.remoteUserId;
    
    // Send end call signal before clearing state
    if (remoteUserId) {
      this.signalRService.sendEndCall(remoteUserId);
    }
    
    // Clear state
    this.signalRService.incomingCall = false;
    this.signalRService.isCalllActive = false;
    
    // Close dialog
    this.dialogRef.close();
  }

  async acceptCall() {
    // Stop ringing tone
    this.signalRService.shouldStopRinging.next(true);
    this.signalRService.incomingCall = false;
    this.signalRService.isCalllActive = true;

    const offerData = this.signalRService.offerReceived.getValue();
    if (offerData) {
      this.signalRService.callType = offerData.callType;
      
      // If it's a voice call and we already have video tracks, stop them and get audio only
      if (this.signalRService.callType === 'voice') {
        // Stop existing video tracks and remove their senders
        if (this.localVideo && this.localVideo.nativeElement.srcObject) {
          const stream = this.localVideo.nativeElement.srcObject as MediaStream;
          const videoTracks = stream.getVideoTracks();
          
          // Find and remove senders for video tracks
          const senders = this.peerConnection.getSenders();
          senders.forEach(sender => {
            if (sender.track && videoTracks.includes(sender.track)) {
              this.peerConnection.removeTrack(sender);
              sender.track.stop();
            }
          });
        }
        
        // Get audio-only stream and add to peer connection
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioStream.getTracks().forEach(track => this.peerConnection.addTrack(track, audioStream));
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerData.offer));
      
      // Process queued ICE candidates after remote description is set
      await this.processIceCandidateQueue();

      let answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.signalRService.sendAnswer(this.signalRService.remoteUserId, answer);
    }
  }

  async startCall() {
    // If remoteUserId is not set, try to get it from the current chat
    if (!this.signalRService.remoteUserId) {
      // Try to get from ChatService if available
      if (this.chatService?.currentOpenedChat?.()?.id) {
        this.signalRService.remoteUserId = this.chatService.currentOpenedChat()!.id;
        console.log('Retrieved remoteUserId from current chat:', this.signalRService.remoteUserId);
      } else {
        console.error('Cannot start call: remoteUserId is not set and no current chat available');
        // Close dialog if we can't start the call
        this.dialogRef.close();
        return;
      }
    }

    console.log('Starting call to:', this.signalRService.remoteUserId, 'type:', this.signalRService.callType);
    this.signalRService.isCalllActive = true;
    
    // Ensure connection is ready before creating offer
    await this.signalRService.startConnection();
    
    let offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    await this.signalRService.sendOffer(this.signalRService.remoteUserId, offer, this.signalRService.callType);
  }

  setupPeerConnection() {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'stun:stun.services.mozilla.com',
        },
      ],
    };
    
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    
    this.peerConnection = new RTCPeerConnection(config);
    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        this.signalRService.sendIceCandidate(this.signalRService.remoteUserId, event.candidate);
      }
    };
    this.peerConnection.ontrack = event => {
      const stream = event.streams[0];
      if (this.signalRService.callType === 'video' && this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = stream;
      } else if (this.signalRService.callType === 'voice' && this.remoteAudio) {
        // For voice calls, play audio through the audio element
        this.remoteAudio.nativeElement.srcObject = stream;
        // Ensure audio plays (some browsers require explicit play)
        this.remoteAudio.nativeElement.play().catch(err => {
          console.error('Error playing remote audio:', err);
        });
      }
    };
  }
  async startLocalMedia() {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: this.signalRService.callType === 'video',
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (this.signalRService.callType === 'video' && this.localVideo) {
      this.localVideo.nativeElement.srcObject = stream;
    }
    
    stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));
  }

  async endCall() {
    // Store remoteUserId before cleanup
    const remoteUserId = this.signalRService.remoteUserId;
    
    // Send end call signal before clearing state
    if (remoteUserId) {
      this.signalRService.sendEndCall(remoteUserId);
    }

    this.cleanupCall();
  }

  private cleanupCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.setupPeerConnection();
    }

    // Clear ICE candidate queue
    this.iceCandidateQueue = [];

    // Stop all media tracks
    if (this.localVideo && this.localVideo.nativeElement.srcObject) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        this.localVideo.nativeElement.srcObject = null;
      }
    }

    // Also stop remote video tracks
    if (this.remoteVideo && this.remoteVideo.nativeElement.srcObject) {
      const stream = this.remoteVideo.nativeElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        this.remoteVideo.nativeElement.srcObject = null;
      }
    }

    // Stop remote audio tracks
    if (this.remoteAudio && this.remoteAudio.nativeElement.srcObject) {
      const stream = this.remoteAudio.nativeElement.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        this.remoteAudio.nativeElement.srcObject = null;
      }
    }

    this.signalRService.isCalllActive = false;
    this.signalRService.incomingCall = false;
    // Don't clear remoteUserId here - it might be needed if user wants to call back
    // Only clear it when dialog is actually closed
    this.signalRService.callType = 'video'; // Reset to default
    this.dialogRef.close();
  }

  private handleRemoteCallEnd() {
    // Clean up call without sending another end signal (to avoid infinite loop)
    this.cleanupCall();
  }

  closeDialog() {
    // Clear remoteUserId when explicitly closing the dialog
    this.signalRService.remoteUserId = '';
    this.signalRService.incomingCall = false;
    this.signalRService.isCalllActive = false;
    this.dialogRef.close();
  }

  private async processIceCandidateQueue() {
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      if (candidate && this.peerConnection.remoteDescription) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error('Error adding queued ICE candidate:', error);
        }
      }
    }
  }
}
