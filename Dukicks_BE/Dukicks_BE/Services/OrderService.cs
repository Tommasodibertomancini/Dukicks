using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Order;
using Dukicks_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace Dukicks_BE.Services
{
    public class OrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<OrderListItemDto>> GetUserOrdersAsync(string userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderListItemDto
                {
                    Id = o.Id,
                    UserFullName = $"{o.User.FirstName} {o.User.LastName}",
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    PaymentStatus = o.PaymentStatus,
                    ItemCount = o.Items.Sum(i => i.Quantity)
                })
                .ToListAsync();
        }

        public async Task<List<OrderListItemDto>> GetAllOrdersAsync(string? status = null)
        {
            var query = _context.Orders.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            return await query
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderListItemDto
                {
                    Id = o.Id,
                    UserFullName = $"{o.User.FirstName} {o.User.LastName}",
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    PaymentStatus = o.PaymentStatus,
                    ItemCount = o.Items.Sum(i => i.Quantity)
                })
                .ToListAsync();
        }

        public async Task<OrderDto> GetOrderByIdAsync(int id, string? userId = null)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Size)
                .AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(o => o.UserId == userId);
            }

            var order = await query.FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return null;

            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                UserFullName = $"{order.User.FirstName} {order.User.LastName}",
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                PaymentStatus = order.PaymentStatus,
                PaymentMethod = order.PaymentMethod,
                ShippingAddress = order.ShippingAddress,
                City = order.City,
                PostalCode = order.PostalCode,
                Country = order.Country,
                TrackingNumber = order.TrackingNumber,
                ShippedDate = order.ShippedDate,
                DeliveredDate = order.DeliveredDate,
                Items = order.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ProductImage = i.Product.ImageUrl,
                    SizeId = i.SizeId,
                    SizeName = i.Size?.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    SubTotal = i.Quantity * i.UnitPrice
                }).ToList()
            };
        }

        public async Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto model)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var cartItems = await _context.CartItems
                    .Where(ci => ci.UserId == userId)
                    .Include(ci => ci.Product)
                    .Include(ci => ci.Size)
                    .ToListAsync();

                if (!cartItems.Any())
                {
                    return null;
                }

                foreach (var item in cartItems)
                {
                    var productSize = await _context.ProductSizes
                        .FirstOrDefaultAsync(ps => ps.ProductId == item.ProductId && ps.SizeId == item.SizeId);

                    if (productSize == null || productSize.Stock < item.Quantity)
                    {
                        throw new InvalidOperationException($"Product {item.Product.Name} in size {item.Size?.Name} is not available in requested quantity");
                    }
                }

                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.Now,
                    TotalAmount = cartItems.Sum(ci => ci.Quantity * (ci.Product.IsDiscounted ? ci.Product.DiscountPrice.Value : ci.Product.Price)),
                    Status = "Pending",
                    PaymentStatus = "Pending",
                    PaymentMethod = model.PaymentMethod,
                    ShippingAddress = model.ShippingAddress,
                    City = model.City,
                    PostalCode = model.PostalCode,
                    Country = model.Country
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var item in cartItems)
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = item.ProductId,
                        SizeId = item.SizeId,
                        Quantity = item.Quantity,
                        UnitPrice = item.Product.IsDiscounted ? item.Product.DiscountPrice.Value : item.Product.Price
                    };

                    _context.OrderItems.Add(orderItem);

                    var productSize = await _context.ProductSizes
                        .FirstOrDefaultAsync(ps => ps.ProductId == item.ProductId && ps.SizeId == item.SizeId);

                    if (productSize != null)
                    {
                        productSize.Stock -= item.Quantity;
                    }

                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.Stock -= item.Quantity;
                    }
                }

                _context.CartItems.RemoveRange(cartItems);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetOrderByIdAsync(order.Id);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(int id, string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return null;

            order.Status = status;

            if (status == "Shipped" && !order.ShippedDate.HasValue)
            {
                order.ShippedDate = DateTime.Now;
            }

            if (status == "Delivered" && !order.DeliveredDate.HasValue)
            {
                order.DeliveredDate = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return await GetOrderByIdAsync(id);
        }

        public async Task<OrderDto> UpdateOrderPaymentStatusAsync(int id, string paymentStatus, string? transactionId = null)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return null;

            order.PaymentStatus = paymentStatus;

            if (paymentStatus == "Completed" && !string.IsNullOrEmpty(transactionId))
            {
                var transaction = new PaymentTransaction
                {
                    OrderId = order.Id,
                    TransactionId = transactionId,
                    Amount = order.TotalAmount,
                    Status = "Success",
                    Provider = "Stripe",
                    TransactionDate = DateTime.Now
                };

                _context.PaymentTransactions.Add(transaction);
            }

            await _context.SaveChangesAsync();

            return await GetOrderByIdAsync(id);
        }

        public async Task<bool> CancelOrderAsync(int id, string userId)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Size)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
                return false;

            if (order.Status != "Pending")
                return false;

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                order.Status = "Cancelled";
                order.PaymentStatus = "Cancelled";

                foreach (var item in order.Items)
                {
                    var productSize = await _context.ProductSizes
                        .FirstOrDefaultAsync(ps => ps.ProductId == item.ProductId && ps.SizeId == item.SizeId);

                    if (productSize != null)
                    {
                        productSize.Stock += item.Quantity;
                    }

                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        product.Stock += item.Quantity;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }
    }
}