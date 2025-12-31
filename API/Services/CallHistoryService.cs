using API.Data;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class CallHistoryService
{
    private readonly AddDbContext _context;
    private readonly Dictionary<string, CallHistory> _activeCalls = new();

    public CallHistoryService(AddDbContext context)
    {
        _context = context;
    }

    public async Task<int> StartCall(string callerId, string receiverId, string callType)
    {
        var callHistory = new CallHistory
        {
            CallerId = callerId,
            ReceiverId = receiverId,
            CallType = callType,
            CallStatus = "initiated",
            StartTime = DateTime.UtcNow
        };

        _context.CallHistories.Add(callHistory);
        await _context.SaveChangesAsync();

        // Store in active calls dictionary with a key
        var callKey = $"{callerId}_{receiverId}_{callHistory.Id}";
        _activeCalls[callKey] = callHistory;

        return callHistory.Id;
    }

    public async Task UpdateCallStatus(int callId, string status, DateTime? endTime = null, int? duration = null)
    {
        var callHistory = await _context.CallHistories.FindAsync(callId);
        if (callHistory != null)
        {
            callHistory.CallStatus = status;
            if (endTime.HasValue)
            {
                callHistory.EndTime = endTime;
            }
            if (duration.HasValue)
            {
                callHistory.Duration = duration;
            }
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateCallByParticipants(string callerId, string receiverId, string status, DateTime? endTime = null, int? duration = null)
    {
        var callHistory = await _context.CallHistories
            .Where(c => c.CallerId == callerId && c.ReceiverId == receiverId && c.CallStatus == "initiated")
            .OrderByDescending(c => c.StartTime)
            .FirstOrDefaultAsync();

        if (callHistory != null)
        {
            callHistory.CallStatus = status;
            if (endTime.HasValue)
            {
                callHistory.EndTime = endTime;
                callHistory.Duration = (int)(endTime.Value - callHistory.StartTime).TotalSeconds;
            }
            if (duration.HasValue)
            {
                callHistory.Duration = duration;
            }
            await _context.SaveChangesAsync();
        }
    }
}

