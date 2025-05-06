using Dukicks_BE.DTOs.Order;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly OrderService _orderService;

        public OrdersController(OrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserOrders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var orders = await _orderService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders([FromQuery] string? status = null)
        {
            var orders = await _orderService.GetAllOrdersAsync(status);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            var order = await _orderService.GetOrderByIdAsync(id, isAdmin ? null : userId);

            if (order == null)
                return NotFound(new { Message = "Order not found" });

            return Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                var order = await _orderService.CreateOrderAsync(userId, model);

                if (order == null)
                    return BadRequest(new { Message = "Cart is empty" });

                return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var order = await _orderService.UpdateOrderStatusAsync(id, model.Status);

            if (order == null)
                return NotFound(new { Message = "Order not found" });

            return Ok(order);
        }

        [HttpPut("{id}/payment")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var order = await _orderService.UpdateOrderPaymentStatusAsync(id, model.Status, model.TransactionId);

            if (order == null)
                return NotFound(new { Message = "Order not found" });

            return Ok(order);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _orderService.CancelOrderAsync(id, userId);

            if (!result)
                return BadRequest(new { Message = "Order cannot be cancelled" });

            return Ok(new { Message = "Order cancelled successfully" });
        }
    }
}