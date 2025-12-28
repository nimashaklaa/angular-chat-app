using API.Data;
using API.Endpoints;
using API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var JwtSettings = builder.Configuration.GetSection("JWTSettings");

builder.Services.AddDbContext<AddDbContext>(options =>
    options.UseSqlite("Data Source=chatapp.db"));

builder.Services.AddIdentityCore<AppUser>()
    .AddEntityFrameworkStores<AddDbContext>()
    .AddDefaultTokenProviders();
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultScheme = IdentityConstants.ApplicationScheme;
}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(JwtSettings.GetSection("SecretKey").Value!)),
        ValidateIssuer = false,
        ValidateAudience = false,
    };
});

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddAuthorization();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//middleware
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapAccountEndpoints();

app.Run();
