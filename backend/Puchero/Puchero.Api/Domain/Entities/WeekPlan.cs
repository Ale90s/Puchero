namespace Puchero.Api.Domain.Entities;

/// <summary>A family's menu for a specific week. Contains 14 slots.</summary>
public class WeekPlan
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public DateOnly WeekStart { get; set; }   // Monday of the week (ISO)

    public Family Family { get; set; } = null!;
    public ICollection<PlanSlot> Slots { get; set; } = new List<PlanSlot>();
}
