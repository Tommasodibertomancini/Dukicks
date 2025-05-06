using Dukicks_BE.Data;
using Dukicks_BE.Models.Auth;
using Dukicks_BE.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Dukicks_BE.Models;
using Stripe;
using Dukicks_BE.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configurazione Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DuKicks API",
        Version = "v1",
        Description = "API per l'e-commerce di sneakers Dukicks"
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Inserisci il token JWT nel formato: Bearer {token}",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, new string[] {} }
    });
});

// Configurazione JWT
builder.Services.Configure<Jwt>(builder.Configuration.GetSection(nameof(Jwt)));

// Configurazione Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Configurazione Identity
builder
    .Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
    {
        options.SignIn.RequireConfirmedAccount = builder
            .Configuration.GetSection("Identity")
            .GetValue<bool>("RequireConfirmedAccount");

        options.Password.RequiredLength = builder
            .Configuration.GetSection("Identity")
            .GetValue<int>("RequiredLength");

        options.Password.RequireDigit = builder
            .Configuration.GetSection("Identity")
            .GetValue<bool>("RequireDigit");

        options.Password.RequireLowercase = builder
            .Configuration.GetSection("Identity")
            .GetValue<bool>("RequireLowercase");

        options.Password.RequireNonAlphanumeric = builder
            .Configuration.GetSection("Identity")
            .GetValue<bool>("RequireNonAlphanumeric");

        options.Password.RequireUppercase = builder
            .Configuration.GetSection("Identity")
            .GetValue<bool>("RequireUppercase");
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Configurazione Authentication JWT
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration.GetSection(nameof(Jwt)).GetValue<string>("Issuer"),
            ValidAudience = builder.Configuration.GetSection(nameof(Jwt)).GetValue<string>("Audience"),
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration.GetSection(nameof(Jwt)).GetValue<string>("SecurityKey")
                )
            ),
        };
    });

// Configurazione Autorizzazione
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequireUserRole", policy => policy.RequireRole("User"));
});

// Configurazione di Stripe
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

// Registrazione dei servizi
builder.Services.AddScoped<UserManager<ApplicationUser>>();
builder.Services.AddScoped<SignInManager<ApplicationUser>>();
builder.Services.AddScoped<RoleManager<ApplicationRole>>();

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<SizeService>();
builder.Services.AddScoped<Dukicks_BE.Services.ProductService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<Dukicks_BE.Services.OrderService>();
builder.Services.AddScoped<Dukicks_BE.Services.ReviewService>();
builder.Services.AddScoped<WishlistService>();
builder.Services.AddScoped<ImageService>();
// Aggiungi il servizio di pagamento
builder.Services.AddScoped<PaymentService>();

// Configurazione CORS per frontend React
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
    policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Applica la policy CORS
app.UseCors();

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed dei dati iniziali
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();

        // Ruoli Predefiniti
        string[] roleNames = { "Admin", "User" };

        foreach (var roleName in roleNames)
        {
            var roleExist = await roleManager.RoleExistsAsync(roleName);
            if (!roleExist)
            {
                await roleManager.CreateAsync(new ApplicationRole
                {
                    Name = roleName,
                    Description = $"{roleName} role",
                    NormalizedName = roleName.ToUpper(),
                    IsActive = true,
                    CreatedAt = DateTime.Now
                });
            }
        }

        // Admin di default
        var adminUser = await userManager.FindByEmailAsync("admin@dukicks.com");

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = "admin@dukicks.com",
                Email = "admin@dukicks.com",
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        if (!context.Categories.Any())
        {
            // Seed delle categorie
            var categories = new List<Category>
            {
                new Category { Name = "Running", Description = "Scarpe da corsa per ogni tipo di terreno" },
                new Category { Name = "Basketball", Description = "Scarpe per il campo da basket" },
                new Category { Name = "Lifestyle", Description = "Scarpe per l'uso quotidiano" },
                new Category { Name = "Limited Edition", Description = "Scarpe in edizione limitata" }
            };

            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();

            // Seed delle taglie
            var sizes = new List<Size>
            {
                new Size { Name = "38", Description = "EU sizing" },
                new Size { Name = "39", Description = "EU sizing" },
                new Size { Name = "40", Description = "EU sizing" },
                new Size { Name = "41", Description = "EU sizing" },
                new Size { Name = "42", Description = "EU sizing" },
                new Size { Name = "43", Description = "EU sizing" },
                new Size { Name = "44", Description = "EU sizing" },
                new Size { Name = "45", Description = "EU sizing" }
            };

            context.Sizes.AddRange(sizes);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Si è verificato un errore durante il seeding del database.");
    }
}

app.Run();