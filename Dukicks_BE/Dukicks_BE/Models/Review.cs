using Dukicks_BE.Models.Auth;

namespace Dukicks_BE.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string UserId { get; set; }
        public int Rating { get; set; } 
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Product Product { get; set; }
        public ApplicationUser User { get; set; }
    }
}