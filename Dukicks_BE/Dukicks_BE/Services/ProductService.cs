using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Product;
using Dukicks_BE.DTOs.Size;
using Dukicks_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace Dukicks_BE.Services
{
    public class PagedResponse<T>
    {
        public List<T> Items { get; set; }
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalPages { get; set; }
    }

    public class ProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<ProductListItemDto>> GetAllProductsAsync(
            string? search = null,
            int? categoryId = null,
            string? brand = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string? sortBy = null,
            int page = 1,
            int limit = 9)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Reviews)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p =>
                    p.Name.Contains(search) ||
                    p.Description.Contains(search) ||
                    p.Brand.Contains(search)
                );
            }

            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(p => p.Brand.Contains(brand));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.IsDiscounted
                    ? p.DiscountPrice >= minPrice.Value
                    : p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.IsDiscounted
                    ? p.DiscountPrice <= maxPrice.Value
                    : p.Price <= maxPrice.Value);
            }

            var totalCount = await query.CountAsync();

            query = sortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.IsDiscounted ? p.DiscountPrice : p.Price),
                "price_desc" => query.OrderByDescending(p => p.IsDiscounted ? p.DiscountPrice : p.Price),
                "newest" => query.OrderByDescending(p => p.ReleaseDate),
                "name_asc" => query.OrderBy(p => p.Name),
                "name_desc" => query.OrderByDescending(p => p.Name),
                "brand" => query.OrderBy(p => p.Brand),
                "rating" => query.OrderByDescending(p => p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0),
                _ => query.OrderByDescending(p => p.IsFeatured).ThenBy(p => p.Name)
            };

            var pagedProducts = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(p => new ProductListItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Brand = p.Brand,
                    Price = p.Price,
                    DiscountPrice = p.DiscountPrice,
                    IsDiscounted = p.IsDiscounted,
                    ImageUrl = p.ImageUrl,
                    CategoryName = p.Category.Name,
                    IsFeatured = p.IsFeatured,
                    AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling(totalCount / (double)limit);

            return new PagedResponse<ProductListItemDto>
            {
                Items = pagedProducts,
                Total = totalCount,
                Page = page,
                Limit = limit,
                TotalPages = totalPages
            };
        }

        public async Task<List<ProductListItemDto>> GetFeaturedProductsAsync(int count = 8)
        {
            return await _context.Products
                .Where(p => p.IsFeatured)
                .Include(p => p.Category)
                .Include(p => p.Reviews)
                .OrderBy(p => p.Name)
                .Take(count)
                .Select(p => new ProductListItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Brand = p.Brand,
                    Price = p.Price,
                    DiscountPrice = p.DiscountPrice,
                    IsDiscounted = p.IsDiscounted,
                    ImageUrl = p.ImageUrl,
                    CategoryName = p.Category.Name,
                    IsFeatured = p.IsFeatured,
                    AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0
                })
                .ToListAsync();
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Reviews)
                .Include(p => p.ProductSizes)
                    .ThenInclude(ps => ps.Size)
                .Include(p => p.Features)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return null;

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Brand = product.Brand,
                Description = product.Description,
                Price = product.Price,
                DiscountPrice = product.DiscountPrice,
                IsDiscounted = product.IsDiscounted,
                ImageUrl = product.ImageUrl,
                Stock = product.Stock,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                IsFeatured = product.IsFeatured,
                ReleaseDate = product.ReleaseDate,
                AverageRating = product.Reviews.Any() ? product.Reviews.Average(r => r.Rating) : 0,
                ReviewCount = product.Reviews.Count,
                AvailableSizes = product.ProductSizes.Select(ps => new ProductSizeDto
                {
                    ProductId = ps.ProductId,
                    SizeId = ps.SizeId,
                    SizeName = ps.Size.Name,
                    Stock = ps.Stock
                }).ToList(),
                Features = product.Features.Select(f => new ProductFeatureDto
                {
                    Id = f.Id,
                    Name = f.Name,
                    Value = f.Value
                }).ToList()
            };
        }

        public async Task<ProductDto> CreateProductAsync(ProductCreateDto model)
        {
            var category = await _context.Categories.FindAsync(model.CategoryId);
            if (category == null)
                return null;

            var product = new Product
            {
                Name = model.Name,
                Brand = model.Brand,
                Description = model.Description,
                Price = model.Price,
                DiscountPrice = model.DiscountPrice ?? model.Price,
                IsDiscounted = model.IsDiscounted,
                ImageUrl = model.ImageUrl,
                Stock = 0, 
                CategoryId = model.CategoryId,
                IsFeatured = model.IsFeatured,
                ReleaseDate = model.ReleaseDate ?? DateTime.Now,
                CreatedAt = DateTime.Now
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            if (model.Sizes != null && model.Sizes.Any())
            {
                foreach (var sizeDto in model.Sizes)
                {
                    var size = await _context.Sizes.FindAsync(sizeDto.SizeId);
                    if (size == null)
                        continue;

                    var productSize = new ProductSize
                    {
                        ProductId = product.Id,
                        SizeId = sizeDto.SizeId,
                        Stock = sizeDto.Stock
                    };

                    _context.ProductSizes.Add(productSize);
                    product.Stock += sizeDto.Stock; 
                }
            }

            if (model.Features != null && model.Features.Any())
            {
                foreach (var featureDto in model.Features)
                {
                    var feature = new ProductFeature
                    {
                        ProductId = product.Id,
                        Name = featureDto.Name,
                        Value = featureDto.Value
                    };

                    _context.ProductFeatures.Add(feature);
                }
            }

            await _context.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id);
        }

        public async Task<ProductDto> UpdateProductAsync(ProductUpdateDto model)
        {
            var product = await _context.Products
                .Include(p => p.ProductSizes)
                .Include(p => p.Features)
                .FirstOrDefaultAsync(p => p.Id == model.Id);

            if (product == null)
                return null;

            var category = await _context.Categories.FindAsync(model.CategoryId);
            if (category == null)
                return null;

            product.Name = model.Name;
            product.Brand = model.Brand;
            product.Description = model.Description;
            product.Price = model.Price;
            product.DiscountPrice = model.DiscountPrice ?? model.Price;
            product.IsDiscounted = model.IsDiscounted;
            product.ImageUrl = model.ImageUrl;
            product.CategoryId = model.CategoryId;
            product.IsFeatured = model.IsFeatured;
            product.ReleaseDate = model.ReleaseDate;
            product.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductSizes)
                .Include(p => p.Features)
                .Include(p => p.OrderItems)
                .Include(p => p.CartItems)
                .Include(p => p.WishlistItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return false;

            if (product.OrderItems.Any())
                return false;

            _context.ProductSizes.RemoveRange(product.ProductSizes);
            _context.ProductFeatures.RemoveRange(product.Features);
            _context.CartItems.RemoveRange(product.CartItems);
            _context.WishlistItems.RemoveRange(product.WishlistItems);

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> AddProductFeatureAsync(int productId, ProductFeatureCreateDto model)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return false;

            var feature = new ProductFeature
            {
                ProductId = productId,
                Name = model.Name,
                Value = model.Value
            };

            _context.ProductFeatures.Add(feature);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateProductFeatureAsync(int featureId, ProductFeatureCreateDto model)
        {
            var feature = await _context.ProductFeatures.FindAsync(featureId);
            if (feature == null)
                return false;

            feature.Name = model.Name;
            feature.Value = model.Value;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteProductFeatureAsync(int featureId)
        {
            var feature = await _context.ProductFeatures.FindAsync(featureId);
            if (feature == null)
                return false;

            _context.ProductFeatures.Remove(feature);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<string>> GetBrandsAsync()
        {
            return await _context.Products
                .Select(p => p.Brand)
                .Distinct()
                .OrderBy(b => b)
                .ToListAsync();
        }

        public async Task<bool> UpdateStockAsync(int productId)
        {
            var product = await _context.Products
                .Include(p => p.ProductSizes)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                return false;

            product.Stock = product.ProductSizes.Sum(ps => ps.Stock);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}