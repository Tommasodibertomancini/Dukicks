using Dukicks_BE.DTOs.Size;

namespace Dukicks_BE.DTOs.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Brand { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public bool IsDiscounted { get; set; }
        public string ImageUrl { get; set; }
        public int Stock { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime ReleaseDate { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public List<ProductSizeDto> AvailableSizes { get; set; }
        public List<ProductFeatureDto> Features { get; set; }
    }
}