namespace Dukicks_BE.DTOs.Order
{
    public class OrderListItemDto
    {
        public int Id { get; set; }
        public string UserFullName { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public int ItemCount { get; set; }
    }
}