using System;
using API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace API.Data
{
    public class AddDbContext:IdentityDbContext<AppUser>
    {
        public AddDbContext(DbContextOptions<AddDbContext> options):base (options)
        {

        }
        public DbSet<Message> Messages { get; set; }
        public DbSet<CallHistory> CallHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure CallHistory - no foreign key constraints in database
            // Relationships are maintained at application level via Include()
            modelBuilder.Entity<CallHistory>()
                .HasOne(c => c.Caller)
                .WithMany()
                .HasForeignKey(c => c.CallerId)
                .OnDelete(DeleteBehavior.NoAction)
                .IsRequired(false)
                .HasConstraintName(null); // No database constraint

            modelBuilder.Entity<CallHistory>()
                .HasOne(c => c.Receiver)
                .WithMany()
                .HasForeignKey(c => c.ReceiverId)
                .OnDelete(DeleteBehavior.NoAction)
                .IsRequired(false)
                .HasConstraintName(null); // No database constraint
        }
    }
}