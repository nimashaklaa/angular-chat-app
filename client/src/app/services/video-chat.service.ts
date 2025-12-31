import { inject, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoChatService {
  private hubUrl = 'http://localhost:5001/hubs/video';
  public hubConnection!: HubConnection;

  public incomingCall = false;
  public isCalllActive = false;
  public remoteUserId = '';
  public callType: 'video' | 'voice' = 'video';

  public peerConnection!: RTCPeerConnection;

  public offerReceived = new BehaviorSubject<{
    senderId: string;
    offer: RTCSessionDescriptionInit;
    callType: 'video' | 'voice';
  } | null>(null);
  public answerReceived = new BehaviorSubject<{
    senderId: string;
    answer: RTCSessionDescription;
  } | null>(null);
  public iceCandidateReceived = new BehaviorSubject<{
    senderId: string;
    candidate: RTCIceCandidate;
  } | null>(null);
  public shouldStopRinging = new Subject<boolean>();

  private authService = inject(AuthService);

  startConnection() {
    // If connection already exists and is connected, don't recreate it
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return Promise.resolve();
    }

    // If connection exists but is not connected, remove old handlers and start fresh
    if (this.hubConnection) {
      this.hubConnection.off('ReceiveOffer');
      this.hubConnection.off('ReceiveAnswer');
      this.hubConnection.off('ReceiveIceCandidate');
      this.hubConnection.off('CallEnded');
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => this.authService.getExistingToken!,
      })
      .withAutomaticReconnect()
      .build();

    // Register event handlers BEFORE starting connection
    this.hubConnection.on('ReceiveOffer', (senderId, offer, callType = 'video') => {
      console.log('[VideoChatService] ReceiveOffer received - SenderId:', senderId, 'CallType:', callType);
      this.offerReceived.next({ senderId, offer: JSON.parse(offer), callType: callType as 'video' | 'voice' });
    });

    this.hubConnection.on('ReceiveAnswer', (senderId, answer) => {
      this.answerReceived.next({ senderId, answer: JSON.parse(answer) });
    });

    this.hubConnection.on('ReceiveIceCandidate', (senderId, candidate) => {
      this.iceCandidateReceived.next({ senderId, candidate: JSON.parse(candidate) });
    });

    this.hubConnection.on('CallEnded', () => {
      // Handle call ended
      this.isCalllActive = false;
      this.incomingCall = false;
    });

    this.hubConnection.on('CallDeclined', () => {
      // Handle call declined - update state
      this.isCalllActive = false;
      this.incomingCall = false;
    });

    // Return the promise so we can await it
    return this.hubConnection.start()
      .then(() => {
        console.log('[VideoChatService] SignalR connection established - ConnectionId:', this.hubConnection.connectionId);
      })
      .catch(err => {
        console.error('[VideoChatService] SignalRConnectionError', err);
        throw err;
      });
  }

  async sendOffer(receiverId: string, offer: RTCSessionDescriptionInit, callType: 'video' | 'voice' = 'video') {
    // Ensure connection is ready
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      console.log('SignalR not connected, waiting for connection...');
      try {
        await this.startConnection();
      } catch (error) {
        console.error('Failed to start SignalR connection:', error);
        return;
      }
    }

    if (!receiverId) {
      console.error('Cannot send offer: receiverId is empty');
      return;
    }

    console.log('Sending offer to receiverId:', receiverId, 'callType:', callType);
    this.hubConnection.invoke('SendOffer', receiverId, JSON.stringify(offer), callType)
      .then(() => console.log('Offer sent successfully'))
      .catch(err => console.error('Error sending offer:', err));
  }

  sendAnswer(receiverId: string, answer: RTCSessionDescriptionInit) {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      console.error('Cannot send answer: SignalR not connected');
      return;
    }
    this.hubConnection.invoke('SendAnswer', receiverId, JSON.stringify(answer))
      .catch(err => console.error('Error sending answer:', err));
  }

  sendIceCandidate(receiverId: string, candidate: RTCIceCandidate) {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      console.error('Cannot send ICE candidate: SignalR not connected');
      return;
    }
    this.hubConnection.invoke('SendIceCandidate', receiverId, JSON.stringify(candidate))
      .catch(err => console.error('Error sending ICE candidate:', err));
  }

  sendEndCall(receiverId: string) {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      console.error('Cannot end call: SignalR not connected');
      return;
    }
    this.hubConnection.invoke('EndCall', receiverId)
      .catch(err => console.error('Error ending call:', err));
  }

  sendDeclineCall(callerId: string) {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      console.error('Cannot decline call: SignalR not connected');
      return;
    }
    this.hubConnection.invoke('DeclineCall', callerId)
      .catch(err => console.error('Error declining call:', err));
  }
}
