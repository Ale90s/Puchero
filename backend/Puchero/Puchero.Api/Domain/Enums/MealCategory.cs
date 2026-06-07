namespace Puchero.Api.Domain.Enums;

/// <summary>
/// Para qué servicio es elegible un plato. Un slot de comida solo admite
/// platos Lunch o Both; un slot de cena, Dinner o Both.
/// </summary>
public enum MealCategory
{
    Lunch,
    Dinner,
    Both
}
