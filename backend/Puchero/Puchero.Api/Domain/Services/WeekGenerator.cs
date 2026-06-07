using Puchero.Api.Domain.Entities;
using Puchero.Api.Domain.Enums;

namespace Puchero.Api.Domain.Services;

/// <summary>
/// Builds the 14 slots of a week from a family's meal pool: random, without
/// repeating within the week, respecting each meal's category per service
/// (lunch slots take Lunch/Both; dinner slots take Dinner/Both). If a service
/// runs out of eligible unused meals, it allows the minimum repetition; if it
/// has none at all, the slot is left without a meal.
/// </summary>
public class WeekGenerator
{
    public readonly record struct GeneratedSlot(int DayOfWeek, Service Service, Guid? MealId);

    public IReadOnlyList<GeneratedSlot> Generate(IReadOnlyList<Meal> pool)
    {
        var lunch = pool.Where(m => m.Category is MealCategory.Lunch or MealCategory.Both).ToList();
        var dinner = pool.Where(m => m.Category is MealCategory.Dinner or MealCategory.Both).ToList();

        // Times each meal has been used so far (shared across services so a meal used
        // at lunch is deprioritised at dinner: no repeats until unavoidable).
        var usage = new Dictionary<Guid, int>();
        var slots = new List<GeneratedSlot>(14);
        Guid? lastLunch = null, lastDinner = null;

        for (var day = 0; day < 7; day++)
        {
            var l = Pick(day, Service.Lunch, lunch, usage, lastLunch);
            slots.Add(l);
            if (l.MealId is Guid lid) lastLunch = lid;

            var d = Pick(day, Service.Dinner, dinner, usage, lastDinner);
            slots.Add(d);
            if (d.MealId is Guid did) lastDinner = did;
        }

        return slots;
    }

    private static GeneratedSlot Pick(
        int day, Service service, List<Meal> eligible, Dictionary<Guid, int> usage, Guid? lastOfService)
    {
        if (eligible.Count == 0)
            return new GeneratedSlot(day, service, null);

        // Pick among the least-used eligible meals → spreads any unavoidable repeats
        // evenly instead of clustering the same dish.
        var minUse = eligible.Min(m => usage.GetValueOrDefault(m.Id));
        var candidates = eligible.Where(m => usage.GetValueOrDefault(m.Id) == minUse).ToList();

        // Avoid repeating the previous day's dish for this service when there's a choice.
        if (candidates.Count > 1 && lastOfService is Guid last)
        {
            var withoutLast = candidates.Where(m => m.Id != last).ToList();
            if (withoutLast.Count > 0) candidates = withoutLast;
        }

        var meal = candidates[Random.Shared.Next(candidates.Count)];
        usage[meal.Id] = usage.GetValueOrDefault(meal.Id) + 1;
        return new GeneratedSlot(day, service, meal.Id);
    }
}
