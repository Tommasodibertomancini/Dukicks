using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Dukicks_BE.Models;
using Dukicks_BE.Models.Auth;

namespace Dukicks_BE.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string,
        Microsoft.AspNetCore.Identity.IdentityUserClaim<string>,
        ApplicationUserRole,
        Microsoft.AspNetCore.Identity.IdentityUserLogin<string>,
        Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>,
        Microsoft.AspNetCore.Identity.IdentityUserToken<string>>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Size> Sizes { get; set; }
        public DbSet<ProductSize> ProductSizes { get; set; }
        public DbSet<ProductFeature> ProductFeatures { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurazione delle relazioni Identity personalizzate
            modelBuilder.Entity<ApplicationUserRole>(userRole =>
            {
                userRole.HasKey(ur => new { ur.UserId, ur.RoleId });

                userRole.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .IsRequired();

                userRole.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .IsRequired();
            });

            // Configurazione delle relazioni Product
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasOne(p => p.Category)
                    .WithMany(c => c.Products)
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(p => p.ProductSizes)
                    .WithOne(ps => ps.Product)
                    .HasForeignKey(ps => ps.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(p => p.Features)
                    .WithOne(pf => pf.Product)
                    .HasForeignKey(pf => pf.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configurazione delle relazioni Size
            modelBuilder.Entity<Size>(entity =>
            {
                entity.HasMany(s => s.ProductSizes)
                    .WithOne(ps => ps.Size)
                    .HasForeignKey(ps => ps.SizeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configurazione unica per ProductSize
            modelBuilder.Entity<ProductSize>(entity =>
            {
                entity.HasIndex(ps => new { ps.ProductId, ps.SizeId }).IsUnique();
            });

            // Configurazione delle relazioni CartItem
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.HasOne(ci => ci.User)
                    .WithMany(u => u.CartItems)
                    .HasForeignKey(ci => ci.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.Product)
                    .WithMany(p => p.CartItems)
                    .HasForeignKey(ci => ci.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ci => ci.Size)
                    .WithMany()
                    .HasForeignKey(ci => ci.SizeId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            });

            // Configurazione delle relazioni Order
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasOne(o => o.User)
                    .WithMany(u => u.Orders)
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(o => o.Items)
                    .WithOne(oi => oi.Order)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(o => o.PaymentTransactions)
                    .WithOne(pt => pt.Order)
                    .HasForeignKey(pt => pt.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configurazione delle relazioni OrderItem
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasOne(oi => oi.Product)
                    .WithMany(p => p.OrderItems)
                    .HasForeignKey(oi => oi.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(oi => oi.Size)
                    .WithMany()
                    .HasForeignKey(oi => oi.SizeId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            });

            // Configurazione delle relazioni Review
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasOne(r => r.User)
                    .WithMany(u => u.Reviews)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Product)
                    .WithMany(p => p.Reviews)
                    .HasForeignKey(r => r.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configurazione delle relazioni WishlistItem
            modelBuilder.Entity<WishlistItem>(entity =>
            {
                entity.HasOne(wi => wi.User)
                    .WithMany(u => u.WishlistItems)
                    .HasForeignKey(wi => wi.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(wi => wi.Product)
                    .WithMany(p => p.WishlistItems)
                    .HasForeignKey(wi => wi.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(wi => new { wi.UserId, wi.ProductId }).IsUnique();
            });

            modelBuilder.Entity<ApplicationUser>().ToTable("Users");
            modelBuilder.Entity<ApplicationRole>().ToTable("Roles");
            modelBuilder.Entity<ApplicationUserRole>().ToTable("UserRoles");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("UserClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("UserLogins");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("RoleClaims");
            modelBuilder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("UserTokens");
        }
    }
}