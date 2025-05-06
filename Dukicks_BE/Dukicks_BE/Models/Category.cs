namespace Dukicks_BE.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation property
        public ICollection<Product> Products { get; set; }
    }
}