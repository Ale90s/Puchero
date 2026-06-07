namespace Puchero.Api.Domain.Services;

/// <summary>Week-date helpers. Weeks run Monday→Sunday (ISO).</summary>
public static class WeekDates
{
    /// <summary>Monday of the week containing <paramref name="date"/>.</summary>
    public static DateOnly MondayOf(DateOnly date)
    {
        var offset = ((int)date.DayOfWeek + 6) % 7; // Mon->0, Tue->1, … Sun->6
        return date.AddDays(-offset);
    }

    /// <summary>Monday of the current week (the one containing today, UTC).</summary>
    public static DateOnly CurrentMonday() => MondayOf(DateOnly.FromDateTime(DateTime.UtcNow));
}
