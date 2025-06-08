using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ReceiptsApi.DTOs;


public class AllocationService
{
    private readonly ILineItemRepository _lineItemRepository;
    private readonly ICategoryRepository _categoryRepository;

    public AllocationService(
        ILineItemRepository lineItemRepository,
        ICategoryRepository categoryRepository)
    {
        _lineItemRepository = lineItemRepository;
        _categoryRepository = categoryRepository;
    }

    public List<LineItem> GetAllocations() //add optional category to filter results
    {
        return _lineItemRepository.GetAllLineItems();
    }
}
