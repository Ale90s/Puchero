using Microsoft.EntityFrameworkCore;
using Puchero.Api.Application.Dtos;
using Puchero.Api.Infrastructure;

namespace Puchero.Api.Application.Queries;

/// <summary>
/// Shared read of a family's week (menu + members + attendance). Reused by the
/// "current week" query and right after generating, so both return the same shape.
/// </summary>
public static class WeekPlanQuery
{
    public static async Task<WeekPlanDto?> LoadAsync(
        PucheroDbContext db, Guid familyId, DateOnly weekStart, CancellationToken ct)
    {
        var plan = await db.WeekPlans
            .Where(w => w.FamilyId == familyId && w.WeekStart == weekStart)
            .Select(w => new
            {
                w.Id,
                w.WeekStart,
                Slots = w.Slots
                    .OrderBy(s => s.DayOfWeek).ThenBy(s => s.Service)
                    .Select(s => new PlanSlotDto(
                        s.Id,
                        s.DayOfWeek,
                        s.Service,
                        s.MealId,
                        s.Meal != null ? s.Meal.Name : null,
                        s.Meal != null ? s.Meal.Category : (Domain.Enums.MealCategory?)null,
                        s.Absences.Select(a => a.UserId).ToList()))
                    .ToList()
            })
            .FirstOrDefaultAsync(ct);

        if (plan is null) return null;

        var members = await db.Users
            .Where(u => u.FamilyId == familyId)
            .OrderBy(u => u.ColorIndex)
            .Select(u => new MemberDto(u.Id, u.Name, u.ColorIndex))
            .ToListAsync(ct);

        return new WeekPlanDto(plan.Id, plan.WeekStart, members, plan.Slots);
    }

    /// <summary>Projects a single slot (after a reroll or an attendance change).</summary>
    public static async Task<PlanSlotDto?> LoadSlotAsync(
        PucheroDbContext db, Guid slotId, CancellationToken ct)
    {
        return await db.PlanSlots
            .Where(s => s.Id == slotId)
            .Select(s => new PlanSlotDto(
                s.Id,
                s.DayOfWeek,
                s.Service,
                s.MealId,
                s.Meal != null ? s.Meal.Name : null,
                s.Meal != null ? s.Meal.Category : (Domain.Enums.MealCategory?)null,
                s.Absences.Select(a => a.UserId).ToList()))
            .FirstOrDefaultAsync(ct);
    }
}
