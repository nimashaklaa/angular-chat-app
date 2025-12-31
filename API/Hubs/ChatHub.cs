using System;
using System.Collections.Concurrent;
using API.Data;
using API.DTOs;
using API.Extensions;
using API.Models;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Hubs;

[Authorize]

public class ChatHub(UserManager<AppUser> userManager, AddDbContext context):Hub
{
    public static readonly ConcurrentDictionary<string, OnlineUserDto> onlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var receiverId = httpContext?.Request.Query["senderId"].ToString();
        var username = Context.User!.Identity!.Name!;
        var currentUser = await userManager.FindByNameAsync(username);
        var connectionId = Context.ConnectionId;

        if(onlineUsers.ContainsKey(username))
        {
            onlineUsers[username].ConnectionId = connectionId;
        }
        else
        {
            var user = new OnlineUserDto
            {
                ConnectionId = connectionId,
                UserName = username,
                ProfileImage = currentUser!.ProfileImage,
                FullName = currentUser.FullName,
            };
            onlineUsers.TryAdd(username, user);

            await Clients.AllExcept(connectionId).SendAsync("Notify", currentUser);
        }
        if(!string.IsNullOrEmpty(receiverId))
        {
            await LoadMessages(receiverId);
        }
        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());

    }
    public async Task LoadMessages(string receiverId, int pageNumber =1)
    {
        int pageSize = 10;
        var username = Context.User!.Identity!.Name;
        var currentUser = await userManager.FindByNameAsync(username!);

        if (currentUser is null) return;
        List<MessageResponseDto> messages = await context.Messages
            .Where(m => (m.ReceiverId == currentUser.Id.ToString() && m.SenderId == receiverId) ||
                        (m.SenderId == currentUser.Id.ToString() && m.ReceiverId == receiverId))
            .OrderByDescending(m => m.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .OrderBy(x => x.Timestamp)
            .Select(m => new MessageResponseDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                Timestamp = m.Timestamp
            })
            .ToListAsync();

        foreach (var message in messages)
        {
            var msg = await context.Messages.FirstOrDefaultAsync(x => x.Id == message.Id);
            if (msg != null && msg.ReceiverId == currentUser.Id.ToString() &&
                !msg.IsRead)
            {
                msg.IsRead = true;
                await context.SaveChangesAsync();
            }
        }
        await Clients.User(currentUser.Id).SendAsync("RecieveMessageList", messages);
    }

    public async Task SendMessage(MessageRequestDto message)
    {
        var senderId = Context.User!.Identity!.Name;
        var recepientId = message.ReceiverId;

        var newMsg = new Message
        {
            Sender = await userManager.FindByNameAsync(senderId!),
            Receiver = await userManager.FindByIdAsync(recepientId!),
            Content = message.Content,
            Timestamp = DateTime.UtcNow,
            IsRead = false
        };
        context.Messages.Add(newMsg);
        await context.SaveChangesAsync();    
        
        await Clients.User(recepientId!).SendAsync("ReceiveMessage", newMsg);
        
    }

    public async Task NotifyTyping(string recipientUsername)
    {
        var senderUsername = Context.User!.Identity!.Name;
        if (senderUsername is null)
        {
            return;
        }
        var connectionId = onlineUsers.Values.FirstOrDefault(u => u.UserName == recipientUsername)?.ConnectionId;
        if (connectionId != null)
        {
            await Clients.Client(connectionId).SendAsync("NotifyTypingToUser", senderUsername);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var senderUsername = Context.User!.Identity!.Name!;
        onlineUsers.TryRemove(senderUsername, out _);
        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
    }

    private async Task<IEnumerable<OnlineUserDto>> GetAllUsers()
    {
        var username = Context.User!.GetUsername();
        var onlineUsersSet = new HashSet<string>(onlineUsers.Keys);
        var users = await userManager.Users.Select(u=> new OnlineUserDto
        {
            Id = u.Id.ToString(),
            UserName = u.UserName,
            FullName = u.FullName,
            ProfileImage = u.ProfileImage,
            IsOnline = onlineUsersSet.Contains(u.UserName!),
            UnreadMessagesCount = context.Messages.Count(m => m.ReceiverId == username && m.SenderId == u.Id.ToString() && !m.IsRead)
        }).ToListAsync();

        return users;
    }

}
