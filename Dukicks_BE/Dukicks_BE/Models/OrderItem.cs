namespace Dukicks_BE.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int? SizeId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }

        // Navigation properties
        public Order Order { get; set; }
        public Product Product { get; set; }
        public Size Size { get; set; }
    }
}