using Microsoft.EntityFrameworkCore;

public class ReceiptsContext : DbContext
{
    public ReceiptsContext()
    {

    }

    public ReceiptsContext(DbContextOptions options) : base(options) { }

    public DbSet<Category> Categories { get; set; }
    public DbSet<LineItem> LineItems { get; set; }
    public DbSet<Receipt> Receipts { get; set; }
    public DbSet<ReceiptLineItem> ReceiptLineItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Define default values
        base.OnModelCreating(modelBuilder);

        // Seeding default category records
        modelBuilder.Entity<Category>().HasData(
        new Category
        {
            CategoryId = 1,
            CategoryName = "Unknown"
        },
        new Category
        {
            CategoryId = 2,
            CategoryName = "Shared"
        },
        new Category
        {
            CategoryId = 3,
            CategoryName = "PersonA"
        },
        new Category
        {
            CategoryId = 4,
            CategoryName = "PersonB"
        });

        modelBuilder.Entity<LineItem>(entity =>
        {
            entity.Property(e => e.CategoryId)
                  .HasDefaultValue(1);
        });

        // Define relationships
        modelBuilder.Entity<LineItem>()
            .HasOne(li => li.Category)
            .WithMany(c => c.LineItems)
            .HasForeignKey(li => li.CategoryId);

        modelBuilder.Entity<ReceiptLineItem>()
            .HasKey(ri => new { ri.ReceiptId, ri.LineItemId });

        modelBuilder.Entity<ReceiptLineItem>()
            .HasOne(ri => ri.Receipt)
            .WithMany(r => r.ReceiptItems)
            .HasForeignKey(ri => ri.ReceiptId);

        modelBuilder.Entity<ReceiptLineItem>()
            .HasOne(ri => ri.LineItem)
            .WithMany(li => li.ReceiptItems)
            .HasForeignKey(ri => ri.LineItemId);

        modelBuilder.Entity<ReceiptLineItem>()
        .HasOne(ri => ri.Category)
        .WithMany(c => c.ReceiptItems)
        .HasForeignKey(ri => ri.CategoryId);
    }
}