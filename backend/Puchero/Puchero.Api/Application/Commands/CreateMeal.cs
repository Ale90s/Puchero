using Puchero.Api.Application.Dtos;
using Puchero.Api.Domain.Entities;
using Puchero.Api.Domain.Enums;
using Puchero.Api.Infrastructure;
using Puchero.Api.Infrastructure.Auth;

namespace Puchero.Api.Application.Commands;

public record CreateMealCommand(string Name, MealCategory Category);

/// <summary>Adds a meal to the family's pool.</summary>
public class CreateMealHandler(PucheroDbContext db, ICurrentUser currentUser)
{
    public async Task<MealDto> Handle(CreateMealCommand cmd, CancellationToken ct = default)
    {
        var familyId = await currentUser.GetFamilyIdAsync(ct);

        var meal = new Meal
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            Name = cmd.Name.Trim(),
            Category = cmd.Category,
            CreatedAt = DateTime.UtcNow
        };

        db.Meals.Add(meal);
        await db.SaveChangesAsync(ct);

        return new MealDto(meal.Id, meal.Name, meal.Category);
    }
}
