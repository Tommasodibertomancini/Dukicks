using Dukicks_BE.DTOs.Review;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewService _reviewService;

        public ReviewsController(ReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            var reviews = await _reviewService.GetProductReviewsAsync(productId);
            return Ok(reviews);
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUserReviews()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var reviews = await _reviewService.GetUserReviewsAsync(userId);
            return Ok(reviews);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReview(int id)
        {
            var review = await _reviewService.GetReviewByIdAsync(id);

            if (review == null)
                return NotFound(new { Message = "Review not found" });

            return Ok(review);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var hasReviewed = await _reviewService.UserHasReviewedProductAsync(userId, model.ProductId);
            if (hasReviewed)
                return BadRequest(new { Message = "You have already reviewed this product" });

            var hasPurchased = await _reviewService.UserHasPurchasedProductAsync(userId, model.ProductId);
            if (!hasPurchased)
                return BadRequest(new { Message = "You can only review products you have purchased" });

            var review = await _reviewService.CreateReviewAsync(userId, model);

            if (review == null)
                return BadRequest(new { Message = "Failed to create review" });

            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var review = await _reviewService.UpdateReviewAsync(id, userId, model);

            if (review == null)
                return NotFound(new { Message = "Review not found or you don't have permission to update it" });

            return Ok(review);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");

            var result = await _reviewService.DeleteReviewAsync(id, userId, isAdmin);

            if (!result)
                return NotFound(new { Message = "Review not found or you don't have permission to delete it" });

            return Ok(new { Message = "Review deleted successfully" });
        }

        [HttpGet("product/{productId}/rating")]
        public async Task<IActionResult> GetProductRating(int productId)
        {
            var rating = await _reviewService.GetProductAverageRatingAsync(productId);
            return Ok(new { Rating = rating });
        }

        [HttpGet("product/{productId}/user-can-review")]
        [Authorize]
        public async Task<IActionResult> UserCanReviewProduct(int productId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var hasReviewed = await _reviewService.UserHasReviewedProductAsync(userId, productId);
            var hasPurchased = await _reviewService.UserHasPurchasedProductAsync(userId, productId);

            return Ok(new { CanReview = hasPurchased && !hasReviewed });
        }
    }
}