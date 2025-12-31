import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CallHistoryService } from '../../services/call-history.service';
import { CallHistory } from '../../Models/call-history';

@Component({
  selector: 'app-call-history',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full w-full bg-white overflow-y-auto">
      <div class="p-4 border-b sticky top-0 bg-white z-10">
        <h2 class="text-xl font-bold">Call History</h2>
      </div>
      
      @if (callHistoryService.isLoading()) {
        <div class="flex justify-center items-center p-8">
          <div class="text-gray-500">Loading call history...</div>
        </div>
      } @else if (callHistoryService.callHistory().length === 0) {
        <div class="flex flex-col justify-center items-center p-8 text-gray-500">
          <mat-icon class="text-6xl mb-4 opacity-50">phone_disabled</mat-icon>
          <p>No call history</p>
        </div>
      } @else {
        <div class="divide-y">
          @for (call of callHistoryService.callHistory(); track call.id) {
            <div class="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4">
              <div class="flex-shrink-0">
                <img
                  [src]="call.isIncoming ? call.callerProfileImage : call.receiverProfileImage"
                  [alt]="call.isIncoming ? call.callerName : call.receiverName"
                  class="w-12 h-12 rounded-full object-cover"
                  onerror="this.src='https://via.placeholder.com/50'"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-gray-900">
                    {{ call.isIncoming ? call.callerName : call.receiverName }}
                  </span>
                  <mat-icon class="text-sm" [class.text-green-500]="call.callStatus === 'completed'" [class.text-red-500]="call.callStatus === 'declined'" [class.text-gray-500]="call.callStatus === 'missed'">
                    {{ call.callType === 'video' ? 'videocam' : 'phone' }}
                  </mat-icon>
                  @if (call.isIncoming) {
                    <span class="text-xs text-gray-500">Incoming</span>
                  } @else {
                    <span class="text-xs text-gray-500">Outgoing</span>
                  }
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>{{ callHistoryService.formatCallTime(call.startTime) }}</span>
                  @if (call.duration) {
                    <span>•</span>
                    <span>{{ callHistoryService.formatDuration(call.duration) }}</span>
                  }
                  <span class="ml-auto capitalize">{{ call.callStatus }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: ``,
})
export class CallHistoryComponent implements OnInit {
  callHistoryService = inject(CallHistoryService);

  ngOnInit(): void {
    this.callHistoryService.getCallHistory();
  }
}

