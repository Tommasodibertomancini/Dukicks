using Dukicks_BE.DTOs.Image;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ImagesController : ControllerBase
    {
        private readonly ImageService _imageService;

        public ImagesController(ImageService imageService)
        {
            _imageService = imageService;
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                var result = await _imageService.UploadImageAsync(file);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while uploading the image" });
            }
        }

        [HttpPost("upload-base64")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadBase64Image([FromBody] UploadImageDto model)
        {
            try
            {
                var result = await _imageService.UploadBase64ImageAsync(model);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while uploading the image" });
            }
        }

        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteImage([FromBody] DeleteImageDto model)
        {
            try
            {
                var result = _imageService.DeleteImage(model.ImageUrl);

                if (!result)
                    return NotFound(new { Message = "Image not found" });

                return Ok(new { Message = "Image deleted successfully" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while deleting the image" });
            }
        }
    }
}