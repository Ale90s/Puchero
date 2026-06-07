namespace Puchero.Api.Domain.Entities;

/// <summary>
/// Attendance exception. By default EVERYONE eats; a row here means
/// this user is NOT eating in this slot. diners = members − absentees.
/// </summary>
public class Attendance
{
    public Guid Id { get; set; }
    public Guid PlanSlotId { get; set; }
    public Guid UserId { get; set; }

    public PlanSlot PlanSlot { get; set; } = null!;
    public User User { get; set; } = null!;
}
