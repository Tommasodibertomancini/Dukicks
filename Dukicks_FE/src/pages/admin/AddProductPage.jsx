import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import { productService } from '../../services';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import ProductForm from '../../components/admin/ProductForm';

const AddProductPage = () => {
  const navigate = useNavigate();
  const { requireAdmin } = useAuth();

  useEffect(() => {
    requireAdmin(() => {
      console.log('Utente autenticato come Admin');
    });
  }, [requireAdmin]);

  const handleSubmit = async (productData) => {
    try {
      const releaseDate = productData.releaseDate
        ? new Date(productData.releaseDate).toISOString()
        : new Date().toISOString();

      const productCreateDto = {
        name: productData.name || '',
        brand: productData.brand || '',
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        discountPrice: productData.isDiscounted
          ? parseFloat(productData.discountPrice) || 0
          : null,
        isDiscounted: Boolean(productData.isDiscounted),
        imageUrl: productData.imageUrl || '',
        categoryId: parseInt(productData.categoryId) || 0,
        isFeatured: Boolean(productData.isFeatured),
        releaseDate: releaseDate,
        sizes: (productData.sizes || [])
          .filter((s) => s && s.stock > 0 && s.sizeId)
          .map((size) => ({
            sizeId: parseInt(size.sizeId),
            stock: parseInt(size.stock),
          })),
        features: [],
      };

      console.log(
        'DTO formattato per il backend:',
        JSON.stringify(productCreateDto, null, 2)
      );

      await productService.createProduct(productCreateDto);

      toast.success('Prodotto creato con successo!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Errore nella creazione del prodotto:', error);
      toast.error(
        'Si è verificato un errore durante la creazione del prodotto.'
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
            title='Aggiungi Nuovo Prodotto'
            breadcrumbs={[
              { label: 'Prodotti', path: '/admin/products' },
              { label: 'Nuovo Prodotto' },
            ]}
          />

          <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </Col>
      </Row>
    </Container>
  );
};

export default AddProductPage;
