using System;

namespace API.Models;

public class Message
{
    public int Id { get; set; }
    public string? SenderId { get; set; } = string.Empty;
    public string? ReceiverId { get; set; } = string.Empty;
    public string? Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
    public AppUser? Sender { get; set; }
    public AppUser? Receiver { get; set; }

}
