using Puchero.Api.Domain.Enums;

namespace Puchero.Api.Domain.Entities;

/// <summary>A dish in the family's recipe pool.</summary>
public class Meal
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public required string Name { get; set; }
    public MealCategory Category { get; set; }
    public DateTime CreatedAt { get; set; }

    public Family Family { get; set; } = null!;
}
