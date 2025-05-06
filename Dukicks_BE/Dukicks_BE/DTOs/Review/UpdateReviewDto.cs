namespace Dukicks_BE.DTOs.Review
{
    public class UpdateReviewDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}