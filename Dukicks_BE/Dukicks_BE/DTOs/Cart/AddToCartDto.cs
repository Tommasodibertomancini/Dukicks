namespace Dukicks_BE.DTOs.Cart
{
    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public int SizeId { get; set; }
        public int Quantity { get; set; }
    }
}