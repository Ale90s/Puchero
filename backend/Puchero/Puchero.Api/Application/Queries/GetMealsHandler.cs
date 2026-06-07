using Microsoft.EntityFrameworkCore;
using Puchero.Api.Application.Dtos;
using Puchero.Api.Infrastructure;
using Puchero.Api.Infrastructure.Auth;

namespace Puchero.Api.Application.Queries;

/// <summary>Lists the family's meal pool, ordered by name.</summary>
public class GetMealsHandler(PucheroDbContext db, ICurrentUser currentUser)
{
    public async Task<IReadOnlyList<MealDto>> Handle(CancellationToken ct = default)
    {
        var familyId = await currentUser.GetFamilyIdAsync(ct);

        return await db.Meals
            .Where(m => m.FamilyId == familyId)
            .OrderBy(m => m.Name)
            .Select(m => new MealDto(m.Id, m.Name, m.Category))
            .ToListAsync(ct);
    }
}
