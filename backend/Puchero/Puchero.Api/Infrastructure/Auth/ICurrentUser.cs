namespace Puchero.Api.Infrastructure.Auth;

/// <summary>
/// Access to the authenticated user of the current request. The Id comes from
/// the Supabase JWT 'sub' claim; the FamilyId is resolved by looking up its row.
/// This is the multi-tenant "glue": every query is filtered by FamilyId.
/// </summary>
public interface ICurrentUser
{
    Guid Id { get; }
    Task<Guid> GetFamilyIdAsync(CancellationToken ct = default);
}
