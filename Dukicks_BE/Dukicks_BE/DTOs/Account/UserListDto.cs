namespace Dukicks_BE.DTOs.Account
{
    public class UserListDto
    {
        public required string UserId { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public List<string>? Roles { get; set; }
        public DateTime RegistrationDate { get; set; }
        public int OrderCount { get; set; }
    }
}