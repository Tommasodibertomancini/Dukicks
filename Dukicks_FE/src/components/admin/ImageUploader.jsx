import React, { useState, useRef } from 'react';
import { Button, Form, ProgressBar, Alert } from 'react-bootstrap';
import { FaUpload, FaImage } from 'react-icons/fa';
import { imageService } from '../../services';

const ImageUploader = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(
        "Il file selezionato non è un'immagine valida. Seleziona un file in formato JPG, PNG o GIF."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'immagine è troppo grande. La dimensione massima è 5MB.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 10;
          if (next >= 90) {
            clearInterval(interval);
            return 90;
          }
          return next;
        });
      }, 300);

      const response = await imageService.uploadImage(selectedFile);
      const imageUrl = response.imageUrl || response;

      clearInterval(interval);
      setProgress(100);

      onUpload(imageUrl);

      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
    } catch (err) {
      console.error("Errore durante il caricamento dell'immagine:", err);
      setError(
        "Si è verificato un errore durante il caricamento dell'immagine. Riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className='image-uploader'>
      <div className='mb-3'>
        {previewUrl && (
          <div className='my-3 text-center'>
            <img
              src={previewUrl}
              alt='Preview'
              className='img-thumbnail'
              style={{ maxHeight: '150px' }}
            />
          </div>
        )}

        <div className='d-flex gap-2'>
          <Form.Control
            type='file'
            ref={fileInputRef}
            className='d-none'
            accept='image/*'
            onChange={handleFileChange}
          />
          <Button
            variant='outline-secondary'
            onClick={triggerFileInput}
            disabled={loading}
            className='w-100'
          >
            <FaImage className='me-2' /> Seleziona immagine
          </Button>

          {selectedFile && (
            <Button variant='primary' onClick={handleUpload} disabled={loading}>
              {loading ? (
                <span
                  className='spinner-border spinner-border-sm'
                  role='status'
                  aria-hidden='true'
                ></span>
              ) : (
                <FaUpload />
              )}
            </Button>
          )}
        </div>

        {selectedFile && (
          <div className='mt-2 small text-muted'>
            {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}
      </div>

      {loading && progress > 0 && (
        <ProgressBar now={progress} label={`${progress}%`} className='mb-3' />
      )}

      {error && (
        <Alert variant='danger' className='mt-3 mb-0 py-2 small'>
          {error}
        </Alert>
      )}
    </div>
  );
};

export default ImageUploader;
