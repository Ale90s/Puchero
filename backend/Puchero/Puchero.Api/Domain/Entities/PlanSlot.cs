using Puchero.Api.Domain.Enums;

namespace Puchero.Api.Domain.Entities;

/// <summary>
/// Un hueco del menú: un día (0=lunes..6=domingo) y un servicio (comida/cena),
/// con el plato asignado. 14 por WeekPlan.
/// </summary>
public class PlanSlot
{
    public Guid Id { get; set; }
    public Guid WeekPlanId { get; set; }
    public int DayOfWeek { get; set; }        // 0 = lunes ... 6 = domingo
    public Service Service { get; set; }
    public Guid? MealId { get; set; }

    public WeekPlan WeekPlan { get; set; } = null!;
    public Meal? Meal { get; set; }

    /// <summary>Ausencias: existencia de una fila = ese usuario NO come en este slot.</summary>
    public ICollection<Attendance> Absences { get; set; } = new List<Attendance>();
}
