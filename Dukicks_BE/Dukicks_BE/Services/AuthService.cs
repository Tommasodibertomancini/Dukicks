using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Account;
using Dukicks_BE.Models.Auth;
using Dukicks_BE.Settings;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Dukicks_BE.Services
{
    public class AuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ApplicationDbContext _context;
        private readonly Jwt _jwtSettings;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<ApplicationRole> roleManager,
            ApplicationDbContext context,
            IOptions<Jwt> jwtSettings)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _context = context;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<TokenResponseDto> LoginAsync(LoginRequestDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return null;
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
            {
                return null;
            }

            var userRoles = await _userManager.GetRolesAsync(user);

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecurityKey));
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                expires: DateTime.Now.AddMinutes(_jwtSettings.ExpiresInMinutes),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return new TokenResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expires = token.ValidTo
            };
        }

        public async Task<IdentityResult> RegisterAsync(RegisterRequestDto model)
        {
            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User already exists!" });
            }

            ApplicationUser user = new()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                return result;
            }

            await _userManager.AddToRoleAsync(user, "User");

            return result;
        }

        public async Task<UserProfileDto> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            var roles = await _userManager.GetRolesAsync(user);

            return new UserProfileDto
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                City = user.City,
                PostalCode = user.PostalCode,
                Country = user.Country,
                Roles = roles.ToList()
            };
        }

        public async Task<IdentityResult> UpdateUserProfileAsync(string userId, UpdateProfileDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User not found!" });
            }

            if (!string.IsNullOrEmpty(model.FirstName))
                user.FirstName = model.FirstName;

            if (!string.IsNullOrEmpty(model.LastName))
                user.LastName = model.LastName;

            if (!string.IsNullOrEmpty(model.PhoneNumber))
                user.PhoneNumber = model.PhoneNumber;

            if (!string.IsNullOrEmpty(model.Address))
                user.Address = model.Address;

            if (!string.IsNullOrEmpty(model.City))
                user.City = model.City;

            if (!string.IsNullOrEmpty(model.PostalCode))
                user.PostalCode = model.PostalCode;

            if (!string.IsNullOrEmpty(model.Country))
                user.Country = model.Country;

            return await _userManager.UpdateAsync(user);
        }

        public async Task<IdentityResult> ChangePasswordAsync(string userId, ChangePasswordDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return IdentityResult.Failed(new IdentityError { Description = "User not found!" });
            }

            return await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
        }

        public async Task<List<UserListDto>> GetAllUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserListDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var orderCount = await _context.Orders.CountAsync(o => o.UserId == user.Id);

                userDtos.Add(new UserListDto
                {
                    UserId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Roles = roles.ToList(),
                    RegistrationDate = user.RegistrationDate,
                    OrderCount = orderCount
                });
            }

            return userDtos;
        }
    }
}