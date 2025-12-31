using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using API.Services;
using Microsoft.Extensions.DependencyInjection;

namespace API.Hubs;

[Authorize]
public class VideoChatHub:Hub
{
    private readonly IServiceScopeFactory _scopeFactory;

    public VideoChatHub(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }
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
            // Save call history when offer is sent - use scope factory to get fresh DbContext
            if (!string.IsNullOrEmpty(senderId) && !string.IsNullOrEmpty(receiverId))
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var callHistoryService = scope.ServiceProvider.GetRequiredService<CallHistoryService>();
                    await callHistoryService.StartCall(senderId, receiverId, callType);
                }
            }

            await Clients.User(receiverId).SendAsync("ReceiveOffer", senderId, offer, callType);
            Console.WriteLine($"[VideoChatHub] Offer sent successfully to user: {receiverId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VideoChatHub] Error sending offer to {receiverId}: {ex.Message}");
            Console.WriteLine($"[VideoChatHub] Stack trace: {ex.StackTrace}");
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
        var senderId = Context.UserIdentifier;
        
        // Update call history when call ends - use scope factory to get fresh DbContext
        if (!string.IsNullOrEmpty(senderId) && !string.IsNullOrEmpty(receiverId))
        {
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var callHistoryService = scope.ServiceProvider.GetRequiredService<CallHistoryService>();
                    await callHistoryService.UpdateCallByParticipants(senderId, receiverId, "completed", DateTime.UtcNow);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[VideoChatHub] Error updating call history: {ex.Message}");
                Console.WriteLine($"[VideoChatHub] Stack trace: {ex.StackTrace}");
            }
        }

        await Clients.User(receiverId).SendAsync("CallEnded");
    }

    public async Task DeclineCall(string callerId)
    {
        var receiverId = Context.UserIdentifier;
        
        // Update call history when call is declined - use scope factory to get fresh DbContext
        if (!string.IsNullOrEmpty(callerId) && !string.IsNullOrEmpty(receiverId))
        {
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var callHistoryService = scope.ServiceProvider.GetRequiredService<CallHistoryService>();
                    // Update the call history to "declined" status
                    await callHistoryService.UpdateCallByParticipants(callerId, receiverId, "declined", DateTime.UtcNow);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[VideoChatHub] Error updating call history: {ex.Message}");
                Console.WriteLine($"[VideoChatHub] Stack trace: {ex.StackTrace}");
            }
        }

        // Notify the caller that the call was declined
        await Clients.User(callerId).SendAsync("CallDeclined");
    }

}
