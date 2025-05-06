namespace Dukicks_BE.Models
{
    public class ProductFeature
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; }  
        public string Value { get; set; } 

        public Product Product { get; set; }
    }
}