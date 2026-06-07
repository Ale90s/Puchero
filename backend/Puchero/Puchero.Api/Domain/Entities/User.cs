namespace Puchero.Api.Domain.Entities;

/// <summary>
/// Miembro de la familia. El Id es el MISMO uuid que asigna Supabase Auth:
/// en cada petición se lee el claim 'sub' del JWT y se busca este User.
/// </summary>
public class User
{
    public Guid Id { get; set; }            // = uuid de Supabase Auth
    public Guid FamilyId { get; set; }
    public required string Name { get; set; }
    public int ColorIndex { get; set; }     // 0-4, tono del avatar
    public required string Email { get; set; }

    public Family Family { get; set; } = null!;
}
