using Dukicks_BE.Models.Auth;

namespace Dukicks_BE.Models
{
    public class WishlistItem
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int ProductId { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.Now;

        public ApplicationUser User { get; set; }
        public Product Product { get; set; }
    }
}