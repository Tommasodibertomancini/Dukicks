using Microsoft.AspNetCore.Identity;

namespace Dukicks_BE.Models.Auth
{
    public class ApplicationUserRole : IdentityUserRole<string>
    {
        public virtual ApplicationUser User { get; set; }
        public virtual ApplicationRole Role { get; set; }
        public DateTime AssignedDate { get; set; } = DateTime.Now;
        public string AssignedBy { get; set; }
    }
}
