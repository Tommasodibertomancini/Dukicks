namespace Dukicks_BE.DTOs.Order
{
    public class CreateOrderDto
    {
        public string ShippingAddress { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
        public string PaymentMethod { get; set; }
        public List<OrderItemCreateDto> Items { get; set; }
    }
}