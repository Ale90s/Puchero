using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Puchero.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// --- Persistencia: EF Core + PostgreSQL (Supabase), nombres snake_case en la BD ---
builder.Services.AddDbContext<PucheroDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres"))
           .UseSnakeCaseNamingConvention());

// --- Autenticación: validar el JWT que emite Supabase (clave asimétrica vía JWKS) ---
var supabase = builder.Configuration.GetSection("Supabase");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Authority descubre OIDC + JWKS automáticamente desde Supabase.
        options.Authority = supabase["Issuer"];
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

// --- CORS para el front Angular en desarrollo ---
const string FrontendCors = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCors, policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()));

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(FrontendCors);
app.UseAuthentication();
app.UseAuthorization();

// Endpoint tonto para el cron anti-sleep de Render (no requiere auth).
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .AllowAnonymous();

app.MapControllers();

app.Run();
