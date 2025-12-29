using System;
using API.common;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Endpoints;

public static class AccountEndpoint
{
    public static RouteGroupBuilder MapAccountEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/account").WithTags("account");

        group.MapPost("/register",async(HttpContext context, UserManager<AppUser> userManager,[FromForm] string FullName, [FromForm] string Email, [FromForm] string Password, [FromForm] string UserName, [FromForm] IFormFile? ProfileImage) =>
        {
            var userFromDb = await userManager.FindByEmailAsync(Email);
            if(userFromDb != null)
            {
                return Results.BadRequest(Response<string>.Fail("User already exists with this email"));
            }
            if(ProfileImage is null)
            {
                return Results.BadRequest(Response<string>.Fail("Profile image is required"));
            }
            var picture = await Services.FileUpload.Upload(ProfileImage);
            picture = $"{context.Request.Scheme}://{context.Request.Host}/uploads/{picture}";
            var user = new AppUser
            {
                Email = Email,
                FullName = FullName,
                UserName = UserName,
                ProfileImage = picture
            };
            var result = await userManager.CreateAsync(user, Password);
            if(!result.Succeeded)
            {
                return Results.BadRequest(Response<string>.Fail(result.Errors.Select(e => e.Description).FirstOrDefault() ?? "User creation failed"));
            }
            return Results.Ok(Response<string>.Success("","Register Endpoint"));
        }).WithName("Register").DisableAntiforgery();  

        group.MapPost("/login", async(UserManager<AppUser> userManager, Services.TokenService tokenService, LoginDto dto) =>
        {
            if (dto is null)
            {
                return Results.BadRequest(Response<string>.Fail("Invalid login request"));
            }
            
            var user = await userManager.FindByEmailAsync(dto.Email);
            if(user == null)
            {
                return Results.BadRequest(Response<string>.Fail("Invalid email or password"));
            }
            var isPasswordValid = await userManager.CheckPasswordAsync(user!, dto.Password);
            if(!isPasswordValid)
            {
                return Results.BadRequest(Response<string>.Fail("Invalid email or password"));
            }
            var token = tokenService.GenerateToken(user.Id, user.UserName!);

            return Results.Ok(Response<string>.Success(token,"Login Successful"));
            
        }).WithName("Login").DisableAntiforgery();

        return group;
    }
}
