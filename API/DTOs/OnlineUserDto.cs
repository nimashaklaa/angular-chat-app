using System;

namespace API.DTOs;

public class OnlineUserDto
{
    public string? Id { get; set; }
    public string? ConnectionId { get; set; }
    public string? Username { get; set; }
    public string? FullName { get; set; }
    public string? ProfileImage { get; set; }
    public bool IsOnline { get; set; }
    public int UnreadMessagesCount { get; set; }

}
