using Microsoft.EntityFrameworkCore;
using Puchero.Api.Domain.Entities;

namespace Puchero.Api.Infrastructure;

public class PucheroDbContext(DbContextOptions<PucheroDbContext> options) : DbContext(options)
{
    public DbSet<Family> Families => Set<Family>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<WeekPlan> WeekPlans => Set<WeekPlan>();
    public DbSet<PlanSlot> PlanSlots => Set<PlanSlot>();
    public DbSet<Attendance> Attendances => Set<Attendance>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // Enums stored as readable text in the DB (not as int).
        b.Entity<Meal>().Property(m => m.Category).HasConversion<string>().HasMaxLength(10);
        b.Entity<PlanSlot>().Property(s => s.Service).HasConversion<string>().HasMaxLength(10);

        // --- User ---
        b.Entity<User>().HasIndex(u => u.Email).IsUnique();
        b.Entity<User>()
            .HasOne(u => u.Family).WithMany(f => f.Members)
            .HasForeignKey(u => u.FamilyId).OnDelete(DeleteBehavior.Cascade);

        // --- Meal ---
        b.Entity<Meal>()
            .HasOne(m => m.Family).WithMany(f => f.Meals)
            .HasForeignKey(m => m.FamilyId).OnDelete(DeleteBehavior.Cascade);

        // --- WeekPlan: a single week per (family, Monday) ---
        b.Entity<WeekPlan>().HasIndex(w => new { w.FamilyId, w.WeekStart }).IsUnique();
        b.Entity<WeekPlan>()
            .HasOne(w => w.Family).WithMany(f => f.WeekPlans)
            .HasForeignKey(w => w.FamilyId).OnDelete(DeleteBehavior.Cascade);

        // --- PlanSlot: one slot per (week, day, service) ---
        b.Entity<PlanSlot>().HasIndex(s => new { s.WeekPlanId, s.DayOfWeek, s.Service }).IsUnique();
        b.Entity<PlanSlot>()
            .HasOne(s => s.WeekPlan).WithMany(w => w.Slots)
            .HasForeignKey(s => s.WeekPlanId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<PlanSlot>()
            .HasOne(s => s.Meal).WithMany()
            .HasForeignKey(s => s.MealId).OnDelete(DeleteBehavior.SetNull);

        // --- Attendance: one row per (slot, user) = that user does NOT eat there ---
        b.Entity<Attendance>().HasIndex(a => new { a.PlanSlotId, a.UserId }).IsUnique();
        b.Entity<Attendance>()
            .HasOne(a => a.PlanSlot).WithMany(s => s.Absences)
            .HasForeignKey(a => a.PlanSlotId).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Attendance>()
            .HasOne(a => a.User).WithMany()
            .HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
