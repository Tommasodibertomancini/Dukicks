using Dukicks_BE.DTOs.Size;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SizesController : ControllerBase
    {
        private readonly SizeService _sizeService;

        public SizesController(SizeService sizeService)
        {
            _sizeService = sizeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSizes()
        {
            var sizes = await _sizeService.GetAllSizesAsync();
            return Ok(sizes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSize(int id)
        {
            var size = await _sizeService.GetSizeByIdAsync(id);

            if (size == null)
                return NotFound(new { Message = "Size not found" });

            return Ok(size);
        }

        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductSizes(int productId)
        {
            var productSizes = await _sizeService.GetProductSizesAsync(productId);
            return Ok(productSizes);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSize([FromBody] SizeDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var size = await _sizeService.CreateSizeAsync(model);
            return CreatedAtAction(nameof(GetSize), new { id = size.Id }, size);
        }

        [HttpPost("product-size")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddProductSize([FromBody] ProductSizeCreateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var productSize = await _sizeService.AddProductSizeAsync(model);

            if (productSize == null)
                return BadRequest(new { Message = "Product or size not found" });

            return Ok(productSize);
        }

        [HttpPut("product-size")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProductSize([FromBody] ProductSizeUpdateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var productSize = await _sizeService.UpdateProductSizeAsync(model);

            if (productSize == null)
                return NotFound(new { Message = "Product-size relationship not found" });

            return Ok(productSize);
        }

        [HttpDelete("product-size/{productId}/{sizeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProductSize(int productId, int sizeId)
        {
            var result = await _sizeService.DeleteProductSizeAsync(productId, sizeId);

            if (!result)
                return NotFound(new { Message = "Product-size relationship not found" });

            return Ok(new { Message = "Product-size relationship deleted successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSize(int id)
        {
            var result = await _sizeService.DeleteSizeAsync(id);

            if (!result)
                return BadRequest(new { Message = "Size not found or is used by products" });

            return Ok(new { Message = "Size deleted successfully" });
        }
    }
}