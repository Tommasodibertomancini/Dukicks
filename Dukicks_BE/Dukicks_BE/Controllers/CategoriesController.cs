using Dukicks_BE.DTOs.Category;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoriesController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);

            if (category == null)
                return NotFound(new { Message = "Category not found" });

            return Ok(category);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var category = await _categoryService.CreateCategoryAsync(model);
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory([FromBody] CategoryUpdateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var category = await _categoryService.UpdateCategoryAsync(model);

            if (category == null)
                return NotFound(new { Message = "Category not found" });

            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var result = await _categoryService.DeleteCategoryAsync(id);

            if (!result)
                return BadRequest(new { Message = "Category not found or has associated products" });

            return Ok(new { Message = "Category deleted successfully" });
        }
    }
}