using Dukicks_BE.Models.Auth;

namespace Dukicks_BE.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int ProductId { get; set; }
        public int? SizeId { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.Now;

        // Navigation properties
        public ApplicationUser User { get; set; }
        public Product Product { get; set; }
        public Size Size { get; set; }
    }
}