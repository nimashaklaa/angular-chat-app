using API.Data;
using API.Endpoints;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DotNetEnv;

// Load .env file (same pattern as Next.js)
Env.Load();

var builder = WebApplication.CreateBuilder(args);
var JwtSettings = builder.Configuration.GetSection("JWTSettings");

// Get JWT secret from environment variable or user secrets
var jwtSecretKey = builder.Configuration["JWTSettings:SecretKey"]
                   ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY");

if (string.IsNullOrEmpty(jwtSecretKey))
{
    throw new InvalidOperationException(
        "JWT Secret Key is not configured. " +
        "Set it using 'dotnet user-secrets set \"JWTSettings:SecretKey\" \"your-secret-key\"' " +
        "or set the JWT_SECRET_KEY environment variable.");
}

builder.Services.AddDbContext<AddDbContext>(options =>
    options.UseSqlite("Data Source=chatapp.db"));

builder.Services.AddIdentityCore<AppUser>()
    .AddEntityFrameworkStores<AddDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<TokenService>();

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
        IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSecretKey)),
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

app.UseStaticFiles();

app.MapAccountEndpoints();

app.Run();
