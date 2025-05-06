namespace Dukicks_BE.DTOs.Order
{
    public class UpdateOrderStatusDto
    {
        public int OrderId { get; set; }
        public string Status { get; set; }
    }
}