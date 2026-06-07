using Microsoft.EntityFrameworkCore;
using Puchero.Api.Application.Dtos;
using Puchero.Api.Application.Queries;
using Puchero.Api.Domain.Entities;
using Puchero.Api.Domain.Services;
using Puchero.Api.Infrastructure;
using Puchero.Api.Infrastructure.Auth;

namespace Puchero.Api.Application.Commands;

/// <summary>
/// Generates (or regenerates) the menu for the current week. If a plan already
/// exists for the week it is replaced — which also resets that week's attendance.
/// </summary>
public class GenerateWeekPlanHandler(
    PucheroDbContext db, ICurrentUser currentUser, WeekGenerator generator)
{
    public async Task<WeekPlanDto> Handle(CancellationToken ct = default)
    {
        var familyId = await currentUser.GetFamilyIdAsync(ct);
        var weekStart = WeekDates.CurrentMonday();

        // Replace any existing plan for this week (cascade deletes its slots + attendance).
        var existing = await db.WeekPlans
            .FirstOrDefaultAsync(w => w.FamilyId == familyId && w.WeekStart == weekStart, ct);
        if (existing is not null)
        {
            db.WeekPlans.Remove(existing);
            await db.SaveChangesAsync(ct);
        }

        var pool = await db.Meals.Where(m => m.FamilyId == familyId).ToListAsync(ct);

        var plan = new WeekPlan
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            WeekStart = weekStart,
            Slots = generator.Generate(pool).Select(s => new PlanSlot
            {
                Id = Guid.NewGuid(),
                DayOfWeek = s.DayOfWeek,
                Service = s.Service,
                MealId = s.MealId
            }).ToList()
        };

        db.WeekPlans.Add(plan);
        await db.SaveChangesAsync(ct);

        return await WeekPlanQuery.LoadAsync(db, familyId, weekStart, ct)
            ?? throw new InvalidOperationException("Week plan missing right after creation.");
    }
}
