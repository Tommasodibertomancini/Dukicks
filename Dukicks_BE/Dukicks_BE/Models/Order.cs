using Dukicks_BE.Models.Auth;

namespace Dukicks_BE.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } 
        public string PaymentStatus { get; set; } 
        public string PaymentMethod { get; set; }
        public string ShippingAddress { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? DeliveredDate { get; set; }

        public ApplicationUser User { get; set; }
        public ICollection<OrderItem> Items { get; set; }
        public ICollection<PaymentTransaction> PaymentTransactions { get; set; }
    }
}