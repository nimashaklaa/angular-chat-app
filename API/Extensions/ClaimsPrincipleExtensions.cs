using System;
using System.Security.Claims;

namespace API.Extensions;

// helps to extract user information from authentication tokens

public static class ClaimsPrincipleExtensions
{
    public static string GetUsername(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Name)?? throw new Exception("Username not found in claims.");
    }

    // A GUID is a 128-bit (16-byte) number used to uniquely identify information in computer systems. It's also known as UUID (Universally Unique Identifier) in other programming ecosystems
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        return Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("User ID not found in claims."));
    }


}
