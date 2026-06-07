using Microsoft.EntityFrameworkCore;
using Puchero.Api.Infrastructure;
using Puchero.Api.Infrastructure.Auth;

namespace Puchero.Api.Application.Commands;

/// <summary>Deletes a meal from the pool, checking it belongs to the user's family.</summary>
public class DeleteMealHandler(PucheroDbContext db, ICurrentUser currentUser)
{
    /// <returns>true if deleted; false if it doesn't exist or isn't this family's.</returns>
    public async Task<bool> Handle(Guid mealId, CancellationToken ct = default)
    {
        var familyId = await currentUser.GetFamilyIdAsync(ct);

        var meal = await db.Meals
            .FirstOrDefaultAsync(m => m.Id == mealId && m.FamilyId == familyId, ct);

        if (meal is null) return false;

        db.Meals.Remove(meal);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
