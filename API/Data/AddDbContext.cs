using System;
using API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;


namespace API.Data
{
    public class AddDbContext:IdentityDbContext<AppUser>
    {
        public AddDbContext(DbContextOptions<AddDbContext> options):base (options)
        {

        }
    }
}