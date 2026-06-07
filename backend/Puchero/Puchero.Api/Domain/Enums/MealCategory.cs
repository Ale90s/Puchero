namespace Puchero.Api.Domain.Enums;

/// <summary>
/// Which service a meal is eligible for. A lunch slot only accepts
/// Lunch or Both meals; a dinner slot, Dinner or Both.
/// </summary>
public enum MealCategory
{
    Lunch,
    Dinner,
    Both
}
