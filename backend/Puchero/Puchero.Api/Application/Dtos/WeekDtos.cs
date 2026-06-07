using Puchero.Api.Domain.Enums;

namespace Puchero.Api.Application.Dtos;

/// <summary>A family member, for rendering avatars/faces in the week view.</summary>
public record MemberDto(Guid Id, string Name, int ColorIndex);

/// <summary>One slot of the week: a day + service, its meal, and who is NOT eating.</summary>
public record PlanSlotDto(
    Guid Id,
    int DayOfWeek,
    Service Service,
    Guid? MealId,
    string? MealName,
    MealCategory? MealCategory,
    IReadOnlyList<Guid> AbsentUserIds);

/// <summary>The whole current week: menu + members + attendance, in one payload.</summary>
public record WeekPlanDto(
    Guid Id,
    DateOnly WeekStart,
    IReadOnlyList<MemberDto> Members,
    IReadOnlyList<PlanSlotDto> Slots);
