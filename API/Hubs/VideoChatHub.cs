using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace API.Hubs;

[Authorize]
public class VideoChatHub:Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        var userName = Context.User?.Identity?.Name;
        Console.WriteLine($"[VideoChatHub] User connected - UserId: {userId}, UserName: {userName}, ConnectionId: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public async Task SendOffer (string receiverId, string offer, string callType = "video")
    {
        var senderId = Context.UserIdentifier;
        var senderName = Context.User?.Identity?.Name;
        Console.WriteLine($"[VideoChatHub] SendOffer called - SenderId: {senderId}, SenderName: {senderName}, ReceiverId: {receiverId}, CallType: {callType}");
        
        try
        {
            await Clients.User(receiverId).SendAsync("ReceiveOffer", senderId, offer, callType);
            Console.WriteLine($"[VideoChatHub] Offer sent successfully to user: {receiverId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VideoChatHub] Error sending offer to {receiverId}: {ex.Message}");
            throw;
        }
    }

    public async Task SendAnswer(string receiverId, string answer)
    {
        await Clients.User(receiverId).SendAsync("ReceiveAnswer", Context.UserIdentifier, answer);
    }

    public async Task SendIceCandidate(string receiverId, string candidate)
    {
        await Clients.User(receiverId).SendAsync("ReceiveIceCandidate", Context.UserIdentifier, candidate);
    }
    public async Task EndCall(string receiverId)
    {
        await Clients.User(receiverId).SendAsync("CallEnded");
    }

}
