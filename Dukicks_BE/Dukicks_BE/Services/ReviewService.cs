using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Review;
using Dukicks_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace Dukicks_BE.Services
{
    public class ReviewService
    {
        private readonly ApplicationDbContext _context;

        public ReviewService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ReviewDto>> GetProductReviewsAsync(int productId)
        {
            return await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    UserId = r.UserId,
                    UserName = $"{r.User.FirstName} {r.User.LastName}",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<ReviewDto>> GetUserReviewsAsync(string userId)
        {
            return await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.Product)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    UserId = r.UserId,
                    UserName = $"{r.User.FirstName} {r.User.LastName}",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<ReviewDto> GetReviewByIdAsync(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
                return null;

            return new ReviewDto
            {
                Id = review.Id,
                ProductId = review.ProductId,
                UserId = review.UserId,
                UserName = $"{review.User.FirstName} {review.User.LastName}",
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<bool> UserHasPurchasedProductAsync(string userId, int productId)
        {
            return await _context.OrderItems
                .AnyAsync(oi =>
                    oi.ProductId == productId &&
                    oi.Order.UserId == userId &&
                    (oi.Order.Status == "Delivered" ||
                     oi.Order.Status == "Confirmed" ||
                     oi.Order.Status == "Pending"));
        }

        public async Task<bool> UserHasReviewedProductAsync(string userId, int productId)
        {
            return await _context.Reviews
                .AnyAsync(r => r.UserId == userId && r.ProductId == productId);
        }

        public async Task<ReviewDto> CreateReviewAsync(string userId, CreateReviewDto model)
        {
            var product = await _context.Products.FindAsync(model.ProductId);
            if (product == null)
                return null;

            var hasPurchased = await UserHasPurchasedProductAsync(userId, model.ProductId);
            if (!hasPurchased)
                return null;

            var hasReviewed = await UserHasReviewedProductAsync(userId, model.ProductId);
            if (hasReviewed)
                return null;

            var review = new Review
            {
                UserId = userId,
                ProductId = model.ProductId,
                Rating = model.Rating,
                Comment = model.Comment,
                CreatedAt = DateTime.Now
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return await GetReviewByIdAsync(review.Id);
        }

        public async Task<ReviewDto> UpdateReviewAsync(int id, string userId, UpdateReviewDto model)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null || review.UserId != userId)
                return null;

            review.Rating = model.Rating;
            review.Comment = model.Comment;
            review.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return await GetReviewByIdAsync(review.Id);
        }

        public async Task<bool> DeleteReviewAsync(int id, string userId, bool isAdmin)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                return false;

            if (review.UserId != userId && !isAdmin)
                return false;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<double> GetProductAverageRatingAsync(int productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .ToListAsync();

            if (!reviews.Any())
                return 0;

            return reviews.Average(r => r.Rating);
        }
    }
}