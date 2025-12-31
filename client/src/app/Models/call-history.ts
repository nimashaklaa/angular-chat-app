export interface CallHistory {
  id: number;
  callerId: string;
  receiverId: string;
  callerName?: string;
  receiverName?: string;
  callerProfileImage?: string;
  receiverProfileImage?: string;
  callType: 'video' | 'voice';
  callStatus: 'completed' | 'missed' | 'declined' | 'cancelled' | 'initiated';
  startTime: string;
  endTime?: string;
  duration?: number;
  isIncoming: boolean;
}

