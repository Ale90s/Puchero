using Puchero.Api.Domain.Enums;

namespace Puchero.Api.Application.Dtos;

/// <summary>A meal as consumed by the frontend.</summary>
public record MealDto(Guid Id, string Name, MealCategory Category);
