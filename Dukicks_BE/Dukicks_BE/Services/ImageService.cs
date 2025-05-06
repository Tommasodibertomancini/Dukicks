using Dukicks_BE.DTOs.Image;
using Microsoft.AspNetCore.Hosting;

namespace Dukicks_BE.Services
{
    public class ImageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string _imagesFolder;

        public ImageService(IWebHostEnvironment environment)
        {
            _environment = environment;
            _imagesFolder = Path.Combine(_environment.WebRootPath, "images", "products");

            if (!Directory.Exists(_imagesFolder))
            {
                Directory.CreateDirectory(_imagesFolder);
            }
        }

        public async Task<ImageResponseDto> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file uploaded");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Invalid file format. Only .jpg, .jpeg, .png, and .webp are allowed");
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                throw new ArgumentException("File size exceeds 5MB limit");
            }

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_imagesFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return new ImageResponseDto
            {
                ImageUrl = $"/images/products/{fileName}"
            };
        }

        public async Task<ImageResponseDto> UploadBase64ImageAsync(UploadImageDto model)
        {
            if (string.IsNullOrEmpty(model.Base64Image))
            {
                throw new ArgumentException("No image data provided");
            }

            var base64Data = model.Base64Image;
            if (base64Data.Contains(","))
            {
                base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
            }

            byte[] imageBytes;
            try
            {
                imageBytes = Convert.FromBase64String(base64Data);
            }
            catch (FormatException)
            {
                throw new ArgumentException("Invalid base64 image data");
            }

            if (imageBytes.Length > 5 * 1024 * 1024)
            {
                throw new ArgumentException("File size exceeds 5MB limit");
            }

            string fileName = $"{Guid.NewGuid()}.jpg";
            if (!string.IsNullOrEmpty(model.FileName))
            {
                string extension = Path.GetExtension(model.FileName).ToLower();
                if (string.IsNullOrEmpty(extension) || !new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(extension))
                {
                    extension = ".jpg"; 
                }
                fileName = $"{Guid.NewGuid()}{extension}";
            }

            var filePath = Path.Combine(_imagesFolder, fileName);

            await File.WriteAllBytesAsync(filePath, imageBytes);

            return new ImageResponseDto
            {
                ImageUrl = $"/images/products/{fileName}"
            };
        }

        public bool DeleteImage(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
            {
                return false;
            }

            var fileName = Path.GetFileName(imageUrl);
            var filePath = Path.Combine(_imagesFolder, fileName);

            if (!File.Exists(filePath))
            {
                return false;
            }

            File.Delete(filePath);
            return true;
        }
    }
}