public class CategoryRepository : ICategoryRepository
{
    private readonly ReceiptsContext _context;

    public CategoryRepository(ReceiptsContext context)
    {
        _context = context;
    }

    public List<Category> GetAllCategories()
    {
        return _context.Categories.ToList();
    }
}