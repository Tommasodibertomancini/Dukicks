namespace Dukicks_BE.DTOs.Wishlist
{
    public class WishlistItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Brand { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public bool IsDiscounted { get; set; }
    }
}