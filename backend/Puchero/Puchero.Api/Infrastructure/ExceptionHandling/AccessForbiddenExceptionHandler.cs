using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Puchero.Api.Infrastructure.ExceptionHandling;

/// <summary>
/// Turns <see cref="UnauthorizedAccessException"/> (thrown by ICurrentUser when the
/// token's user isn't a member of any family) into a clean 403 instead of a 500.
/// Other exceptions fall through to the default handler (500 ProblemDetails).
/// </summary>
public class AccessForbiddenExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx, Exception exception, CancellationToken ct)
    {
        if (exception is not UnauthorizedAccessException) return false;

        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status403Forbidden,
            Title = "Forbidden",
            Detail = exception.Message
        }, ct);
        return true;
    }
}
