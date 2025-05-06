using Dukicks_BE.DTOs.Wishlist;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly WishlistService _wishlistService;

        public WishlistController(WishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var wishlist = await _wishlistService.GetWishlistAsync(userId);
            return Ok(wishlist);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToWishlist([FromBody] AddToWishlistDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var wishlistItem = await _wishlistService.AddToWishlistAsync(userId, model);

            if (wishlistItem == null)
                return BadRequest(new { Message = "Product not found" });

            return Ok(wishlistItem);
        }

        [HttpDelete("{wishlistItemId}")]
        public async Task<IActionResult> RemoveFromWishlist(int wishlistItemId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _wishlistService.RemoveFromWishlistAsync(userId, wishlistItemId);

            if (!result)
                return NotFound(new { Message = "Wishlist item not found" });

            return Ok(new { Message = "Item removed from wishlist" });
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearWishlist()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _wishlistService.ClearWishlistAsync(userId);
            return Ok(new { Message = "Wishlist cleared successfully" });
        }

        [HttpGet("check/{productId}")]
        public async Task<IActionResult> IsInWishlist(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isInWishlist = await _wishlistService.IsInWishlistAsync(userId, productId);
            return Ok(new { IsInWishlist = isInWishlist });
        }
    }
}