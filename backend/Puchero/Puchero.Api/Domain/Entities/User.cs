namespace Puchero.Api.Domain.Entities;

/// <summary>
/// A family member. The Id is the SAME uuid that Supabase Auth assigns:
/// on each request we read the JWT 'sub' claim and look up this User.
/// </summary>
public class User
{
    public Guid Id { get; set; }            // = Supabase Auth uuid
    public Guid FamilyId { get; set; }
    public required string Name { get; set; }
    public int ColorIndex { get; set; }     // 0-4, avatar tone
    public required string Email { get; set; }

    public Family Family { get; set; } = null!;
}
