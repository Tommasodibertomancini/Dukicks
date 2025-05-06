namespace Dukicks_BE.DTOs.Order
{
    public class OrderItemCreateDto
    {
        public int ProductId { get; set; }
        public int SizeId { get; set; }
        public int Quantity { get; set; }
    }
}