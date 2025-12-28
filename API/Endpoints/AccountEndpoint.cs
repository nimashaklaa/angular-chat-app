using System;
using API.common;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Endpoints;

public static class AccountEndpoint
{
    public static RouteGroupBuilder MapAccountEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/account").WithTags("account");

        group.MapPost("/register",async(HttpContext context, UserManager<AppUser> userManager,[FromForm] string FullName, [FromForm] string Email, [FromForm] string Password) =>
        {
            var userFromDb = await userManager.FindByEmailAsync(Email);
            if(userFromDb != null)
            {
                return Results.BadRequest(Response<string>.Fail("User already exists with this email"));
            }
            var user = new AppUser
            {
                Email = Email,
                FullName = FullName
            };
            var result = await userManager.CreateAsync(user, Password);
            if(!result.Succeeded)
            {
                return Results.BadRequest(Response<string>.Fail(result.Errors.Select(e => e.Description).FirstOrDefault() ?? "User creation failed"));
            }
            return Results.Ok(Response<string>.Success("","Register Endpoint"));
        }).WithName("Register").WithOpenApi();  

        return group;
    }
}
