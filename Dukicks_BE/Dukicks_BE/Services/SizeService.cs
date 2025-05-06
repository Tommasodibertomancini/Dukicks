using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Size;
using Dukicks_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace Dukicks_BE.Services
{
    public class SizeService
    {
        private readonly ApplicationDbContext _context;

        public SizeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SizeDto>> GetAllSizesAsync()
        {
            return await _context.Sizes
                .Select(s => new SizeDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description
                })
                .ToListAsync();
        }

        public async Task<SizeDto> GetSizeByIdAsync(int id)
        {
            var size = await _context.Sizes
                .FirstOrDefaultAsync(s => s.Id == id);

            if (size == null)
                return null;

            return new SizeDto
            {
                Id = size.Id,
                Name = size.Name,
                Description = size.Description
            };
        }

        public async Task<List<ProductSizeDto>> GetProductSizesAsync(int productId)
        {
            return await _context.ProductSizes
                .Where(ps => ps.ProductId == productId)
                .Include(ps => ps.Size)
                .Select(ps => new ProductSizeDto
                {
                    ProductId = ps.ProductId,
                    SizeId = ps.SizeId,
                    SizeName = ps.Size.Name,
                    Stock = ps.Stock
                })
                .ToListAsync();
        }

        public async Task<SizeDto> CreateSizeAsync(SizeDto model)
        {
            var size = new Size
            {
                Name = model.Name,
                Description = model.Description
            };

            _context.Sizes.Add(size);
            await _context.SaveChangesAsync();

            return new SizeDto
            {
                Id = size.Id,
                Name = size.Name,
                Description = size.Description
            };
        }

        public async Task<ProductSizeDto> AddProductSizeAsync(ProductSizeCreateDto model)
        {
            var product = await _context.Products.FindAsync(model.ProductId);
            var size = await _context.Sizes.FindAsync(model.SizeId);

            if (product == null || size == null)
                return null;

            var existingProductSize = await _context.ProductSizes
                .FirstOrDefaultAsync(ps => ps.ProductId == model.ProductId && ps.SizeId == model.SizeId);

            if (existingProductSize != null)
            {
                existingProductSize.Stock = model.Stock;
                await _context.SaveChangesAsync();

                return new ProductSizeDto
                {
                    ProductId = existingProductSize.ProductId,
                    SizeId = existingProductSize.SizeId,
                    SizeName = size.Name,
                    Stock = existingProductSize.Stock
                };
            }

            var productSize = new ProductSize
            {
                ProductId = model.ProductId,
                SizeId = model.SizeId,
                Stock = model.Stock
            };

            _context.ProductSizes.Add(productSize);
            await _context.SaveChangesAsync();

            return new ProductSizeDto
            {
                ProductId = productSize.ProductId,
                SizeId = productSize.SizeId,
                SizeName = size.Name,
                Stock = productSize.Stock
            };
        }

        public async Task<ProductSizeDto> UpdateProductSizeAsync(ProductSizeUpdateDto model)
        {
            var productSize = await _context.ProductSizes
                .Include(ps => ps.Size)
                .FirstOrDefaultAsync(ps => ps.ProductId == model.ProductId && ps.SizeId == model.SizeId);

            if (productSize == null)
                return null;

            productSize.Stock = model.Stock;
            await _context.SaveChangesAsync();

            return new ProductSizeDto
            {
                ProductId = productSize.ProductId,
                SizeId = productSize.SizeId,
                SizeName = productSize.Size.Name,
                Stock = productSize.Stock
            };
        }

        public async Task<bool> DeleteProductSizeAsync(int productId, int sizeId)
        {
            var productSize = await _context.ProductSizes
                .FirstOrDefaultAsync(ps => ps.ProductId == productId && ps.SizeId == sizeId);

            if (productSize == null)
                return false;

            _context.ProductSizes.Remove(productSize);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteSizeAsync(int id)
        {
            var size = await _context.Sizes
                .Include(s => s.ProductSizes)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (size == null)
                return false;

            if (size.ProductSizes.Any())
                return false;

            _context.Sizes.Remove(size);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}