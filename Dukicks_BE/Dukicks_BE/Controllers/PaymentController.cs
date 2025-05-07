using Dukicks_BE.DTOs.Payment;
using Dukicks_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using System.Security.Claims;

namespace Dukicks_BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly IConfiguration _configuration;
        private readonly PaymentService _paymentService;

        public PaymentsController(OrderService orderService, PaymentService paymentService, IConfiguration configuration)
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _configuration = configuration;

            // Configura Stripe con la chiave segreta
            StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
        }

        [HttpPost("create-intent")]
        [AllowAnonymous]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentDto model)
        {
            try
            {
                // Verifica che l'ordine esista e appartenga all'utente
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var order = await _orderService.GetOrderByIdAsync(model.OrderId, userId);

                if (order == null)
                    return NotFound(new { Message = "Ordine non trovato" });

                // Crea un Payment Intent con Stripe
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(order.TotalAmount * 100), // Converti in centesimi
                    Currency = model.Currency ?? "eur",
                    PaymentMethodTypes = new List<string> { "card" },
                    Metadata = new Dictionary<string, string>
                    {
                        { "orderId", order.Id.ToString() }
                    }
                };

                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);

                return Ok(new { ClientSecret = paymentIntent.ClientSecret });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Errore in create-intent: {ex.Message}");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpPost("create-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionDto model)
        {
            try
            {
                // Verifica che l'ordine esista e appartenga all'utente
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var order = await _orderService.GetOrderByIdAsync(model.OrderId, userId);

                if (order == null)
                    return NotFound(new { Message = "Ordine non trovato" });

                // Crea gli elementi per la sessione Stripe Checkout
                var lineItems = new List<SessionLineItemOptions>();

                // Aggiungi i prodotti come line items
                foreach (var item in order.Items)
                {
                    lineItems.Add(new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(item.UnitPrice * 100), // Converti in centesimi
                            Currency = "eur",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = item.ProductName,
                                Description = $"Taglia: {item.SizeName}, Quantità: {item.Quantity}",
                                Images = item.ProductImage != null ? new List<string> { item.ProductImage } : null
                            }
                        },
                        Quantity = item.Quantity
                    });
                }

                // Crea la sessione Stripe Checkout
                var options = new SessionCreateOptions
                {
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = lineItems,
                    Mode = "payment",
                    SuccessUrl = model.SuccessUrl,
                    CancelUrl = model.CancelUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        { "orderId", order.Id.ToString() }
                    }
                };

                var service = new SessionService();
                var session = await service.CreateAsync(options);

                return Ok(new
                {
                    SessionId = session.Id,
                    Url = session.Url
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> HandleStripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _configuration["Stripe:WebhookSecret"]
                );

                // Gestisci gli eventi Stripe
                switch (stripeEvent.Type)
                {
                    case "payment_intent.succeeded":
                        var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                        if (paymentIntent != null && paymentIntent.Metadata.TryGetValue("orderId", out var orderIdString))
                        {
                            if (int.TryParse(orderIdString, out var orderId))
                            {
                                await _orderService.UpdateOrderPaymentStatusAsync(
                                    orderId,
                                    "Completed",
                                    paymentIntent.Id);
                            }
                        }
                        break;

                    case "checkout.session.completed":
                        var session = stripeEvent.Data.Object as Session;
                        if (session != null && session.Metadata.TryGetValue("orderId", out var sessionOrderIdString))
                        {
                            if (int.TryParse(sessionOrderIdString, out var sessionOrderId))
                            {
                                await _orderService.UpdateOrderPaymentStatusAsync(
                                    sessionOrderId,
                                    "Completed",
                                    session.PaymentIntentId);
                            }
                        }
                        break;

                    case "payment_intent.payment_failed":
                        var failedPaymentIntent = stripeEvent.Data.Object as PaymentIntent;
                        if (failedPaymentIntent != null && failedPaymentIntent.Metadata.TryGetValue("orderId", out var failedOrderIdString))
                        {
                            if (int.TryParse(failedOrderIdString, out var failedOrderId))
                            {
                                await _orderService.UpdateOrderPaymentStatusAsync(
                                    failedOrderId,
                                    "Failed",
                                    failedPaymentIntent.Id);
                            }
                        }
                        break;
                }

                return Ok();
            }
            catch (StripeException e)
            {
                return BadRequest(new { Error = e.Message });
            }
        }

        [HttpGet("verify/{transactionId}")]
        public async Task<IActionResult> VerifyPayment(string transactionId)
        {
            try
            {
                var service = new PaymentIntentService();
                var paymentIntent = await service.GetAsync(transactionId);

                return Ok(new
                {
                    Status = paymentIntent.Status,
                    Amount = (decimal)paymentIntent.Amount / 100,
                    Currency = paymentIntent.Currency,
                    PaymentMethod = paymentIntent.PaymentMethodId,
                    OrderId = paymentIntent.Metadata.TryGetValue("orderId", out var orderId) ? orderId : null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }
    }
}