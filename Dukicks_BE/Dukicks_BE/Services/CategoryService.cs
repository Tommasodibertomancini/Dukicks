using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Category;
using Dukicks_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace Dukicks_BE.Services
{
    public class CategoryService
    {
        private readonly ApplicationDbContext _context;

        public CategoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ProductCount = c.Products.Count
                })
                .ToListAsync();
        }

        public async Task<CategoryDto> GetCategoryByIdAsync(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ProductCount = category.Products.Count
            };
        }

        public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto model)
        {
            var category = new Category
            {
                Name = model.Name,
                Description = model.Description,
                CreatedAt = DateTime.Now
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ProductCount = 0
            };
        }

        public async Task<CategoryDto> UpdateCategoryAsync(CategoryUpdateDto model)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == model.Id);

            if (category == null)
                return null;

            category.Name = model.Name;
            category.Description = model.Description;

            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ProductCount = category.Products.Count
            };
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return false;

            if (category.Products.Any())
                return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}