namespace Puchero.Api.Domain.Entities;

/// <summary>
/// Excepción de asistencia. Por defecto TODOS comen; una fila aquí significa
/// que este usuario NO come en este slot. comensales = miembros − ausentes.
/// </summary>
public class Attendance
{
    public Guid Id { get; set; }
    public Guid PlanSlotId { get; set; }
    public Guid UserId { get; set; }

    public PlanSlot PlanSlot { get; set; } = null!;
    public User User { get; set; } = null!;
}
