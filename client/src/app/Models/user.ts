export interface User {
    id: string;
    profilePicture:string;
    photoUrl:string;
    fullName: string;
    isOnline: boolean;
    userName: string;
    connectionId: string;
    unreadMessagesCount: number;
    email: string;
    isTyping: boolean;
}