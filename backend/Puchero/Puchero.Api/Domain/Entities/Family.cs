namespace Puchero.Api.Domain.Entities;

/// <summary>A family (tenant). Everything else hangs off it via FamilyId.</summary>
public class Family
{
    public Guid Id { get; set; }
    public required string Name { get; set; }

    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<Meal> Meals { get; set; } = new List<Meal>();
    public ICollection<WeekPlan> WeekPlans { get; set; } = new List<WeekPlan>();
}
