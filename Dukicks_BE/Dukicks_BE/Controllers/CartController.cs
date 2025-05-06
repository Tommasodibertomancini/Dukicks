using Dukicks_BE.DTOs.Cart;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _cartService.GetCartAsync(userId);
            return Ok(cart);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cartItem = await _cartService.AddToCartAsync(userId, model);

            if (cartItem == null)
                return BadRequest(new { Message = "Product or size not found or not available in requested quantity" });

            return Ok(cartItem);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cartItem = await _cartService.UpdateCartItemAsync(userId, model);

            if (cartItem == null && model.Quantity > 0)
                return NotFound(new { Message = "Cart item not found" });

            return Ok(cartItem);
        }

        [HttpDelete("{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _cartService.RemoveFromCartAsync(userId, cartItemId);

            if (!result)
                return NotFound(new { Message = "Cart item not found" });

            return Ok(new { Message = "Item removed from cart" });
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _cartService.ClearCartAsync(userId);
            return Ok(new { Message = "Cart cleared successfully" });
        }
    }
}