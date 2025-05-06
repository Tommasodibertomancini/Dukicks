namespace Dukicks_BE.DTOs.Order
{
    public class UpdatePaymentStatusDto
    {
        public string Status { get; set; }
        public string? TransactionId { get; set; }
    }
}