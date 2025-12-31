using API.Data;
using API.DTOs;
using API.Extensions;
using API.Models;
using API.common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Endpoints;

public static class CallHistoryEndpoint
{
    public static RouteGroupBuilder MapCallHistoryEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/call-history").WithTags("call-history").RequireAuthorization();

        group.MapGet("/", async (AddDbContext context, HttpContext httpContext) =>
        {
            var currentUserId = httpContext.User.GetUserId().ToString();
            
            var callHistories = await context.CallHistories
                .Where(c => c.CallerId == currentUserId || c.ReceiverId == currentUserId)
                .Include(c => c.Caller)
                .Include(c => c.Receiver)
                .OrderByDescending(c => c.StartTime)
                .Select(c => new CallHistoryDto
                {
                    Id = c.Id,
                    CallerId = c.CallerId,
                    ReceiverId = c.ReceiverId,
                    CallerName = c.Caller!.FullName,
                    ReceiverName = c.Receiver!.FullName,
                    CallerProfileImage = c.Caller.ProfileImage,
                    ReceiverProfileImage = c.Receiver.ProfileImage,
                    CallType = c.CallType,
                    CallStatus = c.CallStatus,
                    StartTime = c.StartTime,
                    EndTime = c.EndTime,
                    Duration = c.Duration,
                    IsIncoming = c.ReceiverId == currentUserId
                })
                .ToListAsync();

            return Results.Ok(Response<List<CallHistoryDto>>.Success(callHistories, "Call history retrieved successfully"));
        }).WithName("GetCallHistory");

        group.MapGet("/{userId}", async (AddDbContext context, HttpContext httpContext, string userId) =>
        {
            var currentUserId = httpContext.User.GetUserId().ToString();
            
            var callHistories = await context.CallHistories
                .Where(c => (c.CallerId == currentUserId && c.ReceiverId == userId) ||
                           (c.CallerId == userId && c.ReceiverId == currentUserId))
                .Include(c => c.Caller)
                .Include(c => c.Receiver)
                .OrderByDescending(c => c.StartTime)
                .Select(c => new CallHistoryDto
                {
                    Id = c.Id,
                    CallerId = c.CallerId,
                    ReceiverId = c.ReceiverId,
                    CallerName = c.Caller!.FullName,
                    ReceiverName = c.Receiver!.FullName,
                    CallerProfileImage = c.Caller.ProfileImage,
                    ReceiverProfileImage = c.Receiver.ProfileImage,
                    CallType = c.CallType,
                    CallStatus = c.CallStatus,
                    StartTime = c.StartTime,
                    EndTime = c.EndTime,
                    Duration = c.Duration,
                    IsIncoming = c.ReceiverId == currentUserId
                })
                .ToListAsync();

            return Results.Ok(Response<List<CallHistoryDto>>.Success(callHistories, "Call history retrieved successfully"));
        }).WithName("GetCallHistoryWithUser");

        return group;
    }
}

