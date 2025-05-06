using Dukicks_BE.DTOs.Product;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductsController(ProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? brand = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 9)
        {
            var products = await _productService.GetAllProductsAsync(search, categoryId, brand, minPrice, maxPrice, sortBy, page, limit);
            return Ok(products);
        }

        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedProducts([FromQuery] int count = 8)
        {
            var products = await _productService.GetFeaturedProductsAsync(count);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);

            if (product == null)
                return NotFound(new { Message = "Product not found" });

            return Ok(product);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _productService.CreateProductAsync(model);

            if (product == null)
                return BadRequest(new { Message = "Category not found" });

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct([FromBody] ProductUpdateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _productService.UpdateProductAsync(model);

            if (product == null)
                return NotFound(new { Message = "Product or category not found" });

            return Ok(product);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProductAsync(id);

            if (!result)
                return BadRequest(new { Message = "Product not found or is part of an order" });

            return Ok(new { Message = "Product deleted successfully" });
        }

        [HttpPost("{productId}/features")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddProductFeature(int productId, [FromBody] ProductFeatureCreateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _productService.AddProductFeatureAsync(productId, model);

            if (!result)
                return NotFound(new { Message = "Product not found" });

            return Ok(new { Message = "Feature added successfully" });
        }

        [HttpPut("features/{featureId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProductFeature(int featureId, [FromBody] ProductFeatureCreateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _productService.UpdateProductFeatureAsync(featureId, model);

            if (!result)
                return NotFound(new { Message = "Feature not found" });

            return Ok(new { Message = "Feature updated successfully" });
        }

        [HttpDelete("features/{featureId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProductFeature(int featureId)
        {
            var result = await _productService.DeleteProductFeatureAsync(featureId);

            if (!result)
                return NotFound(new { Message = "Feature not found" });

            return Ok(new { Message = "Feature deleted successfully" });
        }

        [HttpGet("brands")]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _productService.GetBrandsAsync();
            return Ok(brands);
        }

        [HttpPost("{productId}/update-stock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStock(int productId)
        {
            var result = await _productService.UpdateStockAsync(productId);

            if (!result)
                return NotFound(new { Message = "Product not found" });

            return Ok(new { Message = "Stock updated successfully" });
        }
    }
}