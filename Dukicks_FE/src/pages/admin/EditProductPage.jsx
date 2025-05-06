import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import { productService, sizeService } from '../../services';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import ProductForm from '../../components/admin/ProductForm';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    requireAdmin(() => {
      fetchProduct(id);
    });
  }, [requireAdmin, navigate, id]);

  const fetchProduct = async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProductById(productId);
      setProduct(response);
    } catch (err) {
      console.error('Errore nel caricamento del prodotto:', err);
      setError('Si è verificato un errore nel caricamento del prodotto.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (productData) => {
    try {
      const productUpdateDto = {
        id: parseInt(productData.id),
        name: productData.name,
        brand: productData.brand,
        description: productData.description,
        price: parseFloat(productData.price),
        discountPrice: productData.isDiscounted
          ? parseFloat(productData.discountPrice)
          : null,
        isDiscounted: productData.isDiscounted,
        imageUrl: productData.imageUrl,
        categoryId: parseInt(productData.categoryId),
        isFeatured: productData.isFeatured,
        releaseDate: productData.releaseDate
          ? new Date(productData.releaseDate).toISOString()
          : new Date().toISOString(),
      };

      console.log('Invio dati per aggiornamento prodotto:', productUpdateDto);

      await productService.updateProduct(productUpdateDto);

      if (productData.sizes && productData.sizes.length > 0) {
        for (const size of productData.sizes) {
          if (size.stock > 0) {
            try {
              console.log(
                `Aggiornamento taglia: prodotto ${productData.id}, taglia ${size.sizeId}, quantità ${size.stock}`
              );
              await sizeService.updateProductSize(
                productData.id,
                size.sizeId,
                size.stock
              );
            } catch (sizeError) {
              if (
                sizeError.message &&
                sizeError.message.includes('not found')
              ) {
                console.log(
                  `Creazione nuova relazione taglia: prodotto ${productData.id}, taglia ${size.sizeId}, quantità ${size.stock}`
                );
                await sizeService.addProductSize(productData.id, {
                  sizeId: size.sizeId,
                  stock: size.stock,
                });
              } else {
                throw sizeError;
              }
            }
          }
        }
      }

      toast.success('Prodotto aggiornato con successo!');
      navigate('/admin/products');
    } catch (error) {
      console.error("Errore nell'aggiornamento del prodotto:", error);
      toast.error(
        error.message ||
          "Si è verificato un errore durante l'aggiornamento del prodotto."
      );
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <Container fluid className='admin-container'>
      <Row>
        <Col md={2} className='admin-sidebar'>
          <AdminSidebar />
        </Col>
        <Col md={10} className='admin-content p-4'>
          <AdminHeader
            title='Modifica Prodotto'
            breadcrumbs={[
              { label: 'Prodotti', path: '/admin/products' },
              { label: 'Modifica Prodotto' },
            ]}
          />

          {loading ? (
            <div className='text-center py-5'>
              <Spinner animation='border' role='status'>
                <span className='visually-hidden'>Caricamento...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant='danger'>{error}</Alert>
          ) : !product ? (
            <Alert variant='warning'>Prodotto non trovato.</Alert>
          ) : (
            <ProductForm
              product={product}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditProductPage;
