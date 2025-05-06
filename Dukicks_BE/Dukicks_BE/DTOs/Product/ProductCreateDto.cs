using Dukicks_BE.DTOs.Size;

namespace Dukicks_BE.DTOs.Product
{
    public class ProductCreateDto
    {
        public string Name { get; set; }
        public string Brand { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public bool IsDiscounted { get; set; }
        public string ImageUrl { get; set; }
        public int CategoryId { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public List<ProductSizeCreateDto> Sizes { get; set; }
        public List<ProductFeatureCreateDto> Features { get; set; }
    }
}
