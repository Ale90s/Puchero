namespace Puchero.Api.Domain.Entities;

/// <summary>Menú de una semana concreta de una familia. Contiene 14 slots.</summary>
public class WeekPlan
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public DateOnly WeekStart { get; set; }   // lunes de la semana (ISO)

    public Family Family { get; set; } = null!;
    public ICollection<PlanSlot> Slots { get; set; } = new List<PlanSlot>();
}
