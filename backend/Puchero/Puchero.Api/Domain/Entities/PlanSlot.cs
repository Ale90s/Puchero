using Puchero.Api.Domain.Enums;

namespace Puchero.Api.Domain.Entities;

/// <summary>
/// A menu slot: a day (0=Monday..6=Sunday) and a service (lunch/dinner),
/// with the assigned meal. 14 per WeekPlan.
/// </summary>
public class PlanSlot
{
    public Guid Id { get; set; }
    public Guid WeekPlanId { get; set; }
    public int DayOfWeek { get; set; }        // 0 = Monday ... 6 = Sunday
    public Service Service { get; set; }
    public Guid? MealId { get; set; }

    public WeekPlan WeekPlan { get; set; } = null!;
    public Meal? Meal { get; set; }

    /// <summary>Absences: a row's existence = that user is NOT eating in this slot.</summary>
    public ICollection<Attendance> Absences { get; set; } = new List<Attendance>();
}
