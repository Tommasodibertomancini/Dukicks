namespace Dukicks_BE.Models
{
    public class Size
    {
        public int Id { get; set; }
        public string Name { get; set; }  
        public string Description { get; set; } 

        public ICollection<ProductSize> ProductSizes { get; set; }
    }
}