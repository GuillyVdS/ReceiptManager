using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using Microsoft.Extensions.Logging;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

        if (environment == "Docker")
        {
            // No need to call Env.Load(); Docker injects env vars
        }
        else
        {
            DotNetEnv.Env.Load(".env.development");
        }

        // Add this line to use Kestrel
        //builder.WebHost.UseKestrel();

        // Add services to the container.
        builder.Services.AddControllers();

        // Read ALLOWED_ORIGINS from environment and split into array
        var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? Array.Empty<string>();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigin",
                builder =>
                {
                    builder.WithOrigins(allowedOrigins)
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
        });

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddDbContext<ReceiptsContext>(options =>
            options.UseNpgsql($"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
                              $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                              $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
                              $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")}"));
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddScoped<IReceiptRepository, ReceiptRepository>();
        builder.Services.AddScoped<ILineItemRepository, LineItemRepository>();
        builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
        builder.Services.AddScoped<ReceiptService>();
        builder.Services.AddScoped<AllocationService>();
        var app = builder.Build();

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ReceiptsContext>();
            db.Database.Migrate();
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        //app.UseHttpsRedirection();

        app.UseCors("AllowSpecificOrigin");

        app.UseAuthorization();

        app.MapControllers();

        // Log the URLs the application is listening on
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        app.Lifetime.ApplicationStarted.Register(() =>
        {
            var server = app.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.Server.IServer>();
            var addresses = server.Features.Get<Microsoft.AspNetCore.Hosting.Server.Features.IServerAddressesFeature>()?.Addresses;
            if (addresses != null)
            {
                foreach (var address in addresses)
                {
                    logger.LogInformation("Listening on: {Address}", address);
                }
            }
        });

        app.Run();
    }
}
