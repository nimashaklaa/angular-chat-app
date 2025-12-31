using System;

namespace API.Models;

public class CallHistory
{
    public int Id { get; set; }
    public string? CallerId { get; set; } = string.Empty;
    public string? ReceiverId { get; set; } = string.Empty;
    public string CallType { get; set; } = "video"; // "video" or "voice"
    public string CallStatus { get; set; } = "missed"; // "completed", "missed", "declined", "cancelled"
    public DateTime StartTime { get; set; } = DateTime.UtcNow;
    public DateTime? EndTime { get; set; }
    public int? Duration { get; set; } // Duration in seconds
    public AppUser? Caller { get; set; }
    public AppUser? Receiver { get; set; }
}

