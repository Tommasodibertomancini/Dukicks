using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Cart;
using Dukicks_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace Dukicks_BE.Services
{
    public class CartService
    {
        private readonly ApplicationDbContext _context;

        public CartService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CartSummaryDto> GetCartAsync(string userId)
        {
            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .Include(ci => ci.Product)
                .Include(ci => ci.Size)
                .ToListAsync();

            var cartItemDtos = cartItems.Select(ci => new CartItemDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = ci.Product.Name,
                Brand = ci.Product.Brand,
                ImageUrl = ci.Product.ImageUrl,
                SizeId = ci.SizeId,
                SizeName = ci.Size?.Name,
                Quantity = ci.Quantity,
                UnitPrice = ci.Product.IsDiscounted ? ci.Product.DiscountPrice.Value : ci.Product.Price,
                SubTotal = ci.Quantity * (ci.Product.IsDiscounted ? ci.Product.DiscountPrice.Value : ci.Product.Price)
            }).ToList();

            var subTotal = cartItemDtos.Sum(ci => ci.SubTotal);
            var shippingCost = subTotal > 0 ? CalculateShippingCost(subTotal) : 0;

            return new CartSummaryDto
            {
                Items = cartItemDtos,
                SubTotal = subTotal,
                ShippingCost = shippingCost,
                Total = subTotal + shippingCost,
                ItemCount = cartItemDtos.Sum(ci => ci.Quantity)
            };
        }

        public async Task<CartItemDto> AddToCartAsync(string userId, AddToCartDto model)
        {
            var product = await _context.Products
                .Include(p => p.ProductSizes)
                .FirstOrDefaultAsync(p => p.Id == model.ProductId);

            if (product == null)
                return null;

            var productSize = product.ProductSizes
                .FirstOrDefault(ps => ps.SizeId == model.SizeId);

            if (productSize == null || productSize.Stock < model.Quantity)
                return null;

            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci =>
                    ci.UserId == userId &&
                    ci.ProductId == model.ProductId &&
                    ci.SizeId == model.SizeId);

            if (existingCartItem != null)
            {
                existingCartItem.Quantity += model.Quantity;

                if (existingCartItem.Quantity > productSize.Stock)
                    existingCartItem.Quantity = productSize.Stock;
            }
            else
            {
                existingCartItem = new CartItem
                {
                    UserId = userId,
                    ProductId = model.ProductId,
                    SizeId = model.SizeId,
                    Quantity = model.Quantity,
                    AddedAt = DateTime.Now
                };

                _context.CartItems.Add(existingCartItem);
            }

            await _context.SaveChangesAsync();

            var size = await _context.Sizes.FindAsync(model.SizeId);

            return new CartItemDto
            {
                Id = existingCartItem.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                Brand = product.Brand,
                ImageUrl = product.ImageUrl,
                SizeId = model.SizeId,
                SizeName = size?.Name,
                Quantity = existingCartItem.Quantity,
                UnitPrice = product.IsDiscounted ? product.DiscountPrice.Value : product.Price,
                SubTotal = existingCartItem.Quantity * (product.IsDiscounted ? product.DiscountPrice.Value : product.Price)
            };
        }

        public async Task<CartItemDto> UpdateCartItemAsync(string userId, UpdateCartItemDto model)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Product)
                .Include(ci => ci.Size)
                .FirstOrDefaultAsync(ci => ci.Id == model.CartItemId && ci.UserId == userId);

            if (cartItem == null)
                return null;

            var productSize = await _context.ProductSizes
                .FirstOrDefaultAsync(ps =>
                    ps.ProductId == cartItem.ProductId &&
                    ps.SizeId == cartItem.SizeId);

            if (productSize != null && model.Quantity > productSize.Stock)
                model.Quantity = productSize.Stock;

            cartItem.Quantity = model.Quantity;

            if (model.Quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
            }

            await _context.SaveChangesAsync();

            if (model.Quantity <= 0)
                return null;

            return new CartItemDto
            {
                Id = cartItem.Id,
                ProductId = cartItem.ProductId,
                ProductName = cartItem.Product.Name,
                Brand = cartItem.Product.Brand,
                ImageUrl = cartItem.Product.ImageUrl,
                SizeId = cartItem.SizeId,
                SizeName = cartItem.Size?.Name,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.Product.IsDiscounted ? cartItem.Product.DiscountPrice.Value : cartItem.Product.Price,
                SubTotal = cartItem.Quantity * (cartItem.Product.IsDiscounted ? cartItem.Product.DiscountPrice.Value : cartItem.Product.Price)
            };
        }

        public async Task<bool> RemoveFromCartAsync(string userId, int cartItemId)
        {
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

            if (cartItem == null)
                return false;

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ClearCartAsync(string userId)
        {
            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return true;
        }

        private decimal CalculateShippingCost(decimal subTotal)
        {
            if (subTotal >= 100)
                return 0;

            return 5.99m;
        }
    }
}