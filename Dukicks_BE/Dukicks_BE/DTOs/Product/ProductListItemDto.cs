namespace Dukicks_BE.DTOs.Product
{
    public class ProductListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Brand { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public bool IsDiscounted { get; set; }
        public string ImageUrl { get; set; }
        public string CategoryName { get; set; }
        public bool IsFeatured { get; set; }
        public double AverageRating { get; set; }
    }
}