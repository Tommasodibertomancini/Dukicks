namespace Dukicks_BE.DTOs.Payment
{
    public class CreateCheckoutSessionDto
    {
        public int OrderId { get; set; }
        public string SuccessUrl { get; set; }
        public string CancelUrl { get; set; }
    }
}
