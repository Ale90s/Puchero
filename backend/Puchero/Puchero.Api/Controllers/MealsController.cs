using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Puchero.Api.Application.Commands;
using Puchero.Api.Application.Dtos;
using Puchero.Api.Application.Queries;

namespace Puchero.Api.Controllers;

[ApiController]
[Route("meals")]
[Authorize]
public class MealsController(
    GetMealsHandler getMeals,
    CreateMealHandler createMeal,
    DeleteMealHandler deleteMeal) : ControllerBase
{
    /// <summary>The family's meal pool.</summary>
    [HttpGet]
    public async Task<IReadOnlyList<MealDto>> List(CancellationToken ct)
        => await getMeals.Handle(ct);

    /// <summary>Creates a meal in the family's pool.</summary>
    [HttpPost]
    public async Task<ActionResult<MealDto>> Create(CreateMealCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.Name))
            return BadRequest("El nombre del plato es obligatorio.");

        var meal = await createMeal.Handle(cmd, ct);
        return CreatedAtAction(nameof(List), new { id = meal.Id }, meal);
    }

    /// <summary>Deletes a meal from the pool.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        => await deleteMeal.Handle(id, ct) ? NoContent() : NotFound();
}
