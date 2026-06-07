using Puchero.Api.Application.Dtos;
using Puchero.Api.Domain.Services;
using Puchero.Api.Infrastructure;
using Puchero.Api.Infrastructure.Auth;

namespace Puchero.Api.Application.Queries;

/// <summary>Returns the current week's menu + attendance, or null if not generated yet.</summary>
public class GetCurrentWeekHandler(PucheroDbContext db, ICurrentUser currentUser)
{
    public async Task<WeekPlanDto?> Handle(CancellationToken ct = default)
    {
        var familyId = await currentUser.GetFamilyIdAsync(ct);
        return await WeekPlanQuery.LoadAsync(db, familyId, WeekDates.CurrentMonday(), ct);
    }
}
