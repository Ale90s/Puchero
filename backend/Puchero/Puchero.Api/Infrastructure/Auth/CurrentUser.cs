using Microsoft.EntityFrameworkCore;

namespace Puchero.Api.Infrastructure.Auth;

public class CurrentUser(IHttpContextAccessor http, PucheroDbContext db) : ICurrentUser
{
    private Guid? _familyId;

    public Guid Id
    {
        get
        {
            var sub = http.HttpContext?.User.FindFirst("sub")?.Value
                ?? throw new UnauthorizedAccessException("El token no trae el claim 'sub'.");
            return Guid.Parse(sub);
        }
    }

    public async Task<Guid> GetFamilyIdAsync(CancellationToken ct = default)
    {
        if (_familyId is not null) return _familyId.Value;

        var familyId = await db.Users
            .Where(u => u.Id == Id)
            .Select(u => (Guid?)u.FamilyId)
            .FirstOrDefaultAsync(ct)
            ?? throw new UnauthorizedAccessException("El usuario del token no existe en ninguna familia.");

        _familyId = familyId;
        return familyId;
    }
}
