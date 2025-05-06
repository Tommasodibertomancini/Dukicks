namespace Dukicks_BE.DTOs.Payment
{
    public class CreatePaymentIntentDto
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "eur";
    }
}
