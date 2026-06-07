using Microsoft.EntityFrameworkCore;
using Puchero.Api.Application.Dtos;
using Puchero.Api.Application.Queries;
using Puchero.Api.Domain.Entities;
using Puchero.Api.Infrastructure;
using Puchero.Api.Infrastructure.Auth;

namespace Puchero.Api.Application.Commands;

/// <summary>Body of a set-attendance request. eats=false → that user is NOT eating.</summary>
public record SetAttendanceRequest(Guid UserId, bool Eats);

/// <summary>
/// Marks attendance for a member in a slot. Attendance is by absence: an
/// Attendance row means "not eating". eats=true removes any absence row;
/// eats=false adds one. Shared device → anyone can mark anyone in the family.
/// </summary>
public class SetAttendanceHandler(PucheroDbContext db, ICurrentUser currentUser)
{
    /// <returns>The updated slot, or null if slot/user don't belong to the family.</returns>
    public async Task<PlanSlotDto?> Handle(Guid slotId, SetAttendanceRequest req, CancellationToken ct = default)
    {
        var familyId = await currentUser.GetFamilyIdAsync(ct);

        var slotExists = await db.PlanSlots
            .AnyAsync(s => s.Id == slotId && s.WeekPlan.FamilyId == familyId, ct);
        var userInFamily = await db.Users
            .AnyAsync(u => u.Id == req.UserId && u.FamilyId == familyId, ct);
        if (!slotExists || !userInFamily) return null;

        var absence = await db.Attendances
            .FirstOrDefaultAsync(a => a.PlanSlotId == slotId && a.UserId == req.UserId, ct);

        if (req.Eats && absence is not null)
            db.Attendances.Remove(absence);
        else if (!req.Eats && absence is null)
            db.Attendances.Add(new Attendance
            {
                Id = Guid.NewGuid(),
                PlanSlotId = slotId,
                UserId = req.UserId
            });

        await db.SaveChangesAsync(ct);
        return await WeekPlanQuery.LoadSlotAsync(db, slotId, ct);
    }
}
