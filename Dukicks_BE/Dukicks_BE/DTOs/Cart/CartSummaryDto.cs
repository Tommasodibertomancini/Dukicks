namespace Dukicks_BE.DTOs.Cart
{
    public class CartSummaryDto
    {
        public List<CartItemDto> Items { get; set; }
        public decimal SubTotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal Total { get; set; }
        public int ItemCount { get; set; }
    }
}