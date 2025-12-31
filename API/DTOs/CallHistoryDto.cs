using System;

namespace API.DTOs;

public class CallHistoryDto
{
    public int Id { get; set; }
    public string? CallerId { get; set; }
    public string? ReceiverId { get; set; }
    public string? CallerName { get; set; }
    public string? ReceiverName { get; set; }
    public string? CallerProfileImage { get; set; }
    public string? ReceiverProfileImage { get; set; }
    public string CallType { get; set; } = "video";
    public string CallStatus { get; set; } = "missed";
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? Duration { get; set; }
    public bool IsIncoming { get; set; } // True if current user received the call
}

