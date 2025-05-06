import api from './api';

const imageService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await api.post('images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadBase64Image: async (base64Image, fileName) => {
    return await api.post('images/upload-base64', {
      base64Image,
      fileName,
    });
  },

  deleteImage: async (imageUrl) => {
    return await api.delete('images', {
      data: { imageUrl },
    });
  },
};

export default imageService;
