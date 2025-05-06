using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Wishlist;
using Dukicks_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace Dukicks_BE.Services
{
    public class WishlistService
    {
        private readonly ApplicationDbContext _context;

        public WishlistService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<WishlistItemDto>> GetWishlistAsync(string userId)
        {
            return await _context.WishlistItems
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                .OrderByDescending(w => w.AddedAt)
                .Select(w => new WishlistItemDto
                {
                    Id = w.Id,
                    ProductId = w.ProductId,
                    ProductName = w.Product.Name,
                    Brand = w.Product.Brand,
                    ImageUrl = w.Product.ImageUrl,
                    Price = w.Product.Price,
                    DiscountPrice = w.Product.DiscountPrice,
                    IsDiscounted = w.Product.IsDiscounted
                })
                .ToListAsync();
        }

        public async Task<WishlistItemDto> AddToWishlistAsync(string userId, AddToWishlistDto model)
        {
            var product = await _context.Products.FindAsync(model.ProductId);
            if (product == null)
                return null;

            var existingItem = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == model.ProductId);

            if (existingItem != null)
            {
                return new WishlistItemDto
                {
                    Id = existingItem.Id,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Brand = product.Brand,
                    ImageUrl = product.ImageUrl,
                    Price = product.Price,
                    DiscountPrice = product.DiscountPrice,
                    IsDiscounted = product.IsDiscounted
                };
            }

            var wishlistItem = new WishlistItem
            {
                UserId = userId,
                ProductId = model.ProductId,
                AddedAt = DateTime.Now
            };

            _context.WishlistItems.Add(wishlistItem);
            await _context.SaveChangesAsync();

            return new WishlistItemDto
            {
                Id = wishlistItem.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                Brand = product.Brand,
                ImageUrl = product.ImageUrl,
                Price = product.Price,
                DiscountPrice = product.DiscountPrice,
                IsDiscounted = product.IsDiscounted
            };
        }

        public async Task<bool> RemoveFromWishlistAsync(string userId, int wishlistItemId)
        {
            var wishlistItem = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.Id == wishlistItemId && w.UserId == userId);

            if (wishlistItem == null)
                return false;

            _context.WishlistItems.Remove(wishlistItem);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ClearWishlistAsync(string userId)
        {
            var wishlistItems = await _context.WishlistItems
                .Where(w => w.UserId == userId)
                .ToListAsync();

            _context.WishlistItems.RemoveRange(wishlistItems);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsInWishlistAsync(string userId, int productId)
        {
            return await _context.WishlistItems
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);
        }
    }
}