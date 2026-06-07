using Microsoft.EntityFrameworkCore;
using Puchero.Api.Application.Dtos;
using Puchero.Api.Application.Queries;
using Puchero.Api.Domain.Enums;
using Puchero.Api.Infrastructure;
using Puchero.Api.Infrastructure.Auth;

namespace Puchero.Api.Application.Commands;

/// <summary>
/// Swaps a single slot for another meal eligible for its service, preferring one
/// not already used that week and never the meal currently in the slot.
/// </summary>
public class RerollSlotHandler(PucheroDbContext db, ICurrentUser currentUser)
{
    /// <returns>The updated slot, or null if it doesn't exist / isn't this family's.</returns>
    public async Task<PlanSlotDto?> Handle(Guid slotId, CancellationToken ct = default)
    {
        var familyId = await currentUser.GetFamilyIdAsync(ct);

        var slot = await db.PlanSlots
            .Include(s => s.WeekPlan)
            .FirstOrDefaultAsync(s => s.Id == slotId && s.WeekPlan.FamilyId == familyId, ct);
        if (slot is null) return null;

        var allowed = slot.Service == Service.Lunch
            ? new[] { MealCategory.Lunch, MealCategory.Both }
            : new[] { MealCategory.Dinner, MealCategory.Both };

        var eligible = await db.Meals
            .Where(m => m.FamilyId == familyId && allowed.Contains(m.Category))
            .Select(m => m.Id)
            .ToListAsync(ct);

        // Meals already used elsewhere in this week (to avoid repeating when possible).
        var usedInWeek = await db.PlanSlots
            .Where(s => s.WeekPlanId == slot.WeekPlanId && s.MealId != null && s.Id != slotId)
            .Select(s => s.MealId!.Value)
            .ToListAsync(ct);

        // Best: eligible, not the current meal, not used this week. Then relax "unused".
        var candidates = eligible
            .Where(id => id != slot.MealId && !usedInWeek.Contains(id))
            .ToList();
        if (candidates.Count == 0)
            candidates = eligible.Where(id => id != slot.MealId).ToList();

        // No alternative available (pool too small): leave the slot as is.
        if (candidates.Count > 0)
        {
            slot.MealId = candidates[Random.Shared.Next(candidates.Count)];
            await db.SaveChangesAsync(ct);
        }

        return await WeekPlanQuery.LoadSlotAsync(db, slotId, ct);
    }
}
