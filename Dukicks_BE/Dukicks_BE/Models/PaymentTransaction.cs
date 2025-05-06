using System.ComponentModel.DataAnnotations.Schema;

namespace Dukicks_BE.Models
{
    public class PaymentTransaction
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string TransactionId { get; set; } 

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }
        public string Status { get; set; }  
        public string Provider { get; set; }  
        public DateTime TransactionDate { get; set; } = DateTime.Now;
        public string? Error { get; set; }

        public Order Order { get; set; }
    }
}