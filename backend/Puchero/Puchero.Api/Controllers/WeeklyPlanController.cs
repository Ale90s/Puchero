using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Puchero.Api.Application.Commands;
using Puchero.Api.Application.Dtos;
using Puchero.Api.Application.Queries;

namespace Puchero.Api.Controllers;

[ApiController]
[Route("weekly-plan")]
[Authorize]
public class WeeklyPlanController(
    GenerateWeekPlanHandler generate,
    GetCurrentWeekHandler getCurrent,
    RerollSlotHandler reroll,
    SetAttendanceHandler setAttendance) : ControllerBase
{
    /// <summary>Current week's menu + family attendance. null if not generated yet.</summary>
    [HttpGet("current")]
    public async Task<ActionResult<WeekPlanDto>> Current(CancellationToken ct)
        => Ok(await getCurrent.Handle(ct));

    /// <summary>Generates (or regenerates) the current week. Regenerating resets attendance.</summary>
    [HttpPost("generate")]
    public async Task<ActionResult<WeekPlanDto>> Generate(CancellationToken ct)
        => Ok(await generate.Handle(ct));

    /// <summary>Swaps the meal of a single slot.</summary>
    [HttpPut("slots/{slotId:guid}/reroll")]
    public async Task<ActionResult<PlanSlotDto>> Reroll(Guid slotId, CancellationToken ct)
    {
        var slot = await reroll.Handle(slotId, ct);
        return slot is null ? NotFound() : Ok(slot);
    }

    /// <summary>Marks a member's attendance in a slot. Body: { userId, eats }.</summary>
    [HttpPut("slots/{slotId:guid}/attendance")]
    public async Task<ActionResult<PlanSlotDto>> Attendance(
        Guid slotId, SetAttendanceRequest body, CancellationToken ct)
    {
        var slot = await setAttendance.Handle(slotId, body, ct);
        return slot is null ? NotFound() : Ok(slot);
    }
}
