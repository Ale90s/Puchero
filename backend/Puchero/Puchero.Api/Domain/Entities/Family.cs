namespace Puchero.Api.Domain.Entities;

/// <summary>Una familia (tenant). Todo lo demás cuelga de ella vía FamilyId.</summary>
public class Family
{
    public Guid Id { get; set; }
    public required string Name { get; set; }

    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<Meal> Meals { get; set; } = new List<Meal>();
    public ICollection<WeekPlan> WeekPlans { get; set; } = new List<WeekPlan>();
}
