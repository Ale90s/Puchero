using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Puchero.Api.Application.Commands;
using Puchero.Api.Application.Queries;
using Puchero.Api.Infrastructure;
using Puchero.Api.Infrastructure.Auth;

var builder = WebApplication.CreateBuilder(args);

// --- Persistence: EF Core + PostgreSQL (Supabase), snake_case names in the DB ---
builder.Services.AddDbContext<PucheroDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres"))
           .UseSnakeCaseNamingConvention());

// --- Authentication: validate the JWT issued by Supabase (asymmetric key via JWKS) ---
var supabase = builder.Configuration.GetSection("Supabase");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Authority auto-discovers OIDC + JWKS from Supabase.
        options.Authority = supabase["Issuer"];
        // Don't remap claims: we want to read 'sub' exactly as it comes in the token.
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = supabase["Issuer"],
            ValidAudience = supabase["Audience"],   // "authenticated"
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });
builder.Services.AddAuthorization();

// --- CORS for the Angular frontend in development ---
const string FrontendCors = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCors, policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()));

// Current user (JWT sub -> FamilyId) + CQRS handlers.
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddScoped<GetMealsHandler>();
builder.Services.AddScoped<CreateMealHandler>();
builder.Services.AddScoped<DeleteMealHandler>();

builder.Services.AddControllers()
    .AddJsonOptions(o =>
        // Enums as text in JSON: lunch/dinner/both.
        o.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

// Swagger UI with an "Authorize" button to paste a Supabase JWT.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new OpenApiInfo { Title = "Puchero API", Version = "v1" });

    var bearer = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the Supabase JWT (without the 'Bearer ' prefix)."
    };
    o.AddSecurityDefinition("Bearer", bearer);
    o.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(o => o.SwaggerEndpoint("/swagger/v1/swagger.json", "Puchero API v1"));
}

app.UseHttpsRedirection();

app.UseCors(FrontendCors);
app.UseAuthentication();
app.UseAuthorization();

// Dumb endpoint for Render's anti-sleep cron (no auth required).
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .AllowAnonymous();

app.MapControllers();

app.Run();
