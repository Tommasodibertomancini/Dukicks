using Microsoft.AspNetCore.Identity;

namespace Dukicks_BE.Models.Auth
{
    public class ApplicationRole : IdentityRole
    {
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;

        // Relazione con gli utenti attraverso ApplicationUserRole
        public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }
    }
}
