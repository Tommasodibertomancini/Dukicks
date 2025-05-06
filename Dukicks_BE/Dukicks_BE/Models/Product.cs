using Dukicks_BE.Models.Auth;
using Microsoft.EntityFrameworkCore;

namespace Dukicks_BE.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Brand { get; set; }
        public string Description { get; set; }

        [Precision(10, 2)]
        public decimal Price { get; set; }

        [Precision(10, 2)]
        public decimal? DiscountPrice { get; set; }
        public bool IsDiscounted { get; set; }
        public string ImageUrl { get; set; }
        public int Stock { get; set; }  
        public int CategoryId { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime ReleaseDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Category Category { get; set; }
        public ICollection<ProductSize> ProductSizes { get; set; }
        public ICollection<Review> Reviews { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; }
        public ICollection<CartItem> CartItems { get; set; }
        public ICollection<WishlistItem> WishlistItems { get; set; }
        public ICollection<ProductFeature> Features { get; set; }
    }
}