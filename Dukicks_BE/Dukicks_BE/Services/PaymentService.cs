using Dukicks_BE.Data;
using Dukicks_BE.DTOs.Payment;
using Dukicks_BE.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dukicks_BE.Services
{
    public class PaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly OrderService _orderService;
        private readonly IConfiguration _configuration;

        public PaymentService(
            ApplicationDbContext context,
            OrderService orderService,
            IConfiguration configuration)
        {
            _context = context;
            _orderService = orderService;
            _configuration = configuration;
        }

        /// <summary>
        /// Crea un PaymentIntent di Stripe per un ordine specifico
        /// </summary>
        public async Task<string> CreatePaymentIntentAsync(CreatePaymentIntentDto model, string userId)
        {
            // Verifica che l'ordine esista e appartenga all'utente
            var order = await _orderService.GetOrderByIdAsync(model.OrderId, userId);
            if (order == null)
            {
                throw new Exception("Ordine non trovato");
            }

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(order.TotalAmount * 100), // Converte in centesimi
                Currency = model.Currency ?? "eur",
                PaymentMethodTypes = new List<string> { "card" },
                Metadata = new Dictionary<string, string>
                {
                    { "orderId", order.Id.ToString() }
                }
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            return paymentIntent.ClientSecret;
        }

        /// <summary>
        /// Crea una sessione di checkout Stripe per un ordine
        /// </summary>
        public async Task<SessionCreateResponse> CreateCheckoutSessionAsync(CreateCheckoutSessionDto model, string userId)
        {
            // Verifica che l'ordine esista e appartenga all'utente
            var order = await _orderService.GetOrderByIdAsync(model.OrderId, userId);
            if (order == null)
            {
                throw new Exception("Ordine non trovato");
            }

            // Crea gli elementi per la sessione
            var lineItems = new List<SessionLineItemOptions>();

            // Aggiungi i prodotti come line items
            foreach (var item in order.Items)
            {
                lineItems.Add(new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(item.UnitPrice * 100), // Converte in centesimi
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

            // Crea la sessione
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

            return new SessionCreateResponse
            {
                SessionId = session.Id,
                Url = session.Url
            };
        }

        /// <summary>
        /// Gestisce gli eventi webhook di Stripe
        /// </summary>
        public async Task HandleWebhookEventAsync(string json, string stripeSignature)
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"];

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    stripeSignature,
                    webhookSecret
                );

                // Gestisci gli eventi Stripe in base al tipo
                switch (stripeEvent.Type)
                {
                    case "payment_intent.succeeded":
                        await HandlePaymentIntentSucceededAsync(stripeEvent);
                        break;

                    case "checkout.session.completed":
                        await HandleCheckoutSessionCompletedAsync(stripeEvent);
                        break;

                    case "payment_intent.payment_failed":
                        await HandlePaymentIntentFailedAsync(stripeEvent);
                        break;
                }
            }
            catch (StripeException e)
            {
                throw new Exception($"Errore Stripe: {e.Message}");
            }
        }

        /// <summary>
        /// Aggiorna lo stato di un pagamento dopo una transazione
        /// </summary>
        public async Task<bool> UpdatePaymentStatusAsync(int orderId, string status, string transactionId)
        {
            try
            {
                await _orderService.UpdateOrderPaymentStatusAsync(orderId, status, transactionId);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Verifica lo stato di un pagamento Stripe
        /// </summary>
        public async Task<PaymentIntent> VerifyPaymentAsync(string paymentIntentId)
        {
            var service = new PaymentIntentService();
            return await service.GetAsync(paymentIntentId);
        }

        private async Task HandlePaymentIntentSucceededAsync(Event stripeEvent)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent != null && paymentIntent.Metadata.TryGetValue("orderId", out var orderIdString))
            {
                if (int.TryParse(orderIdString, out var orderId))
                {
                    await _orderService.UpdateOrderPaymentStatusAsync(
                        orderId,
                        "Completed",
                        paymentIntent.Id);

                    // Registra la transazione
                    var transaction = new PaymentTransaction
                    {
                        OrderId = orderId,
                        TransactionId = paymentIntent.Id,
                        Amount = (decimal)paymentIntent.Amount / 100, // Converti da centesimi
                        Status = "Success",
                        Provider = "Stripe",
                        TransactionDate = DateTime.Now
                    };

                    _context.PaymentTransactions.Add(transaction);
                    await _context.SaveChangesAsync();
                }
            }
        }

        private async Task HandleCheckoutSessionCompletedAsync(Event stripeEvent)
        {
            var session = stripeEvent.Data.Object as Session;
            if (session != null && session.Metadata.TryGetValue("orderId", out var sessionOrderIdString))
            {
                if (int.TryParse(sessionOrderIdString, out var sessionOrderId))
                {
                    await _orderService.UpdateOrderPaymentStatusAsync(
                        sessionOrderId,
                        "Completed",
                        session.PaymentIntentId);

                    // Registra la transazione
                    var transaction = new PaymentTransaction
                    {
                        OrderId = sessionOrderId,
                        TransactionId = session.PaymentIntentId,
                        Amount = (decimal)session.AmountTotal / 100, // Converti da centesimi
                        Status = "Success",
                        Provider = "Stripe",
                        TransactionDate = DateTime.Now
                    };

                    _context.PaymentTransactions.Add(transaction);
                    await _context.SaveChangesAsync();
                }
            }
        }

        private async Task HandlePaymentIntentFailedAsync(Event stripeEvent)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent != null && paymentIntent.Metadata.TryGetValue("orderId", out var failedOrderIdString))
            {
                if (int.TryParse(failedOrderIdString, out var failedOrderId))
                {
                    await _orderService.UpdateOrderPaymentStatusAsync(
                        failedOrderId,
                        "Failed",
                        paymentIntent.Id);

                    // Registra la transazione fallita
                    var transaction = new PaymentTransaction
                    {
                        OrderId = failedOrderId,
                        TransactionId = paymentIntent.Id,
                        Amount = (decimal)paymentIntent.Amount / 100, // Converti da centesimi
                        Status = "Failed",
                        Provider = "Stripe",
                        TransactionDate = DateTime.Now
                    };

                    _context.PaymentTransactions.Add(transaction);
                    await _context.SaveChangesAsync();
                }
            }
        }
    }

    public class SessionCreateResponse
    {
        public string SessionId { get; set; }
        public string Url { get; set; }
    }
}