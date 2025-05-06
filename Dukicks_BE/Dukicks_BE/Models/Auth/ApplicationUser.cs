using Microsoft.AspNetCore.Identity;

namespace Dukicks_BE.Models.Auth
{
    public class ApplicationUser : IdentityUser
    {
        // Campi essenziali richiesti alla registrazione
        public string FirstName { get; set; }
        public string LastName { get; set; }

        // Campi opzionali che possono essere aggiornati successivamente
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }

        // Data di registrazione
        public DateTime RegistrationDate { get; set; } = DateTime.Now;

        // Proprietà per il RefreshToken
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }

        // Relazioni
        public virtual ICollection<Order> Orders { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
        public virtual ICollection<CartItem> CartItems { get; set; }
        public virtual ICollection<WishlistItem> WishlistItems { get; set; }

        // Relazione con i ruoli attraverso ApplicationUserRole
        public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }
    }
}