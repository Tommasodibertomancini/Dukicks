namespace Dukicks_BE.DTOs.Cart
{
    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Brand { get; set; }
        public string ImageUrl { get; set; }
        public int? SizeId { get; set; }
        public string SizeName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal SubTotal { get; set; }
    }
}