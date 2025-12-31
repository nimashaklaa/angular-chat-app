import { inject, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoChatService {
  private hubUrl = 'http://localhost:5001/hubs/video';
  public hubConnection!: HubConnection;

  public incomingCall = false;
  public isCalllActive = false;
  public remoteUserId = '';

  public peerConnection!: RTCPeerConnection;

  public offerReceived = new BehaviorSubject<{
    senderId: string;
    offer: RTCSessionDescriptionInit;
  } | null>(null);
  public answerReceived = new BehaviorSubject<{
    senderId: string;
    answer: RTCSessionDescription;
  } | null>(null);
  public iceCandidateReceived = new BehaviorSubject<{
    senderId: string;
    candidate: RTCIceCandidate;
  } | null>(null);

  private authService = inject(AuthService);

  startConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => this.authService.getExistingToken!,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(err => console.error('SignalRConnectionError', err));

    this.hubConnection.on('ReceiveOffer', (senderId, offer) => {
      this.offerReceived.next({ senderId, offer: JSON.parse(offer) });
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
  }

  sendOffer(receiverId: string, offer: RTCSessionDescriptionInit) {
    if (this.hubConnection?.state !== HubConnectionState.Connected) {
      console.error('Cannot send offer: SignalR not connected');
      return;
    }
    this.hubConnection.invoke('SendOffer', receiverId, JSON.stringify(offer))
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
}
