import React, { useState, useEffect } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  Card,
  InputGroup,
  Alert,
} from 'react-bootstrap';
import { FaUpload, FaSave, FaTimes } from 'react-icons/fa';
import { categoryService, sizeService, productService } from '../../services';
import ImageUploader from './ImageUploader';

const ProductForm = ({ product = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: product?.id || 0,
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    categoryId: product?.categoryId || '',
    price: product?.price || '',
    isDiscounted: product?.isDiscounted || false,
    discountPrice: product?.discountPrice || '',
    isFeatured: product?.isFeatured || false,
    imageUrl: product?.imageUrl || '',
    releaseDate: product?.releaseDate
      ? new Date(product.releaseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  });

  const [sizes, setSizes] = useState(product?.availableSizes || []);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchSizes();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await sizeService.getSizes();
      setAvailableSizes(response || []);
    } catch (error) {
      console.error('Errore nel caricamento delle taglie:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await productService.getBrands();
      setBrands(response || []);
    } catch (error) {
      console.error('Errore nel caricamento dei brand:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({
      ...formData,
      imageUrl,
    });
  };

  const handleSizeChange = (sizeId, e) => {
    const value = e.target.value ? parseInt(e.target.value) : 0;
    const existingIndex = sizes.findIndex((s) => s.sizeId === sizeId);

    if (existingIndex !== -1) {
      const updatedSizes = [...sizes];
      updatedSizes[existingIndex] = {
        ...updatedSizes[existingIndex],
        stock: value,
      };
      setSizes(updatedSizes);
    } else {
      const size = availableSizes.find((s) => s.id === sizeId);
      setSizes([
        ...sizes,
        {
          sizeId,
          sizeName: size?.name || '',
          stock: value,
        },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.isDiscounted
          ? parseFloat(formData.discountPrice)
          : null,
        categoryId: parseInt(formData.categoryId),
        sizes: sizes
          .filter((s) => s.stock > 0)
          .map((size) => ({
            sizeId: size.sizeId,
            stock: size.stock,
          })),
        availableSizes: sizes.filter((s) => s.stock > 0),
      };

      await onSubmit(productData);
    } catch (err) {
      console.error('Errore durante il salvataggio del prodotto:', err);
      setError(
        'Si è verificato un errore durante il salvataggio del prodotto.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='border-0 shadow-sm'>
      <Card.Body>
        {error && (
          <Alert variant='danger' className='mb-4'>
            {error}
          </Alert>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3' controlId='name'>
                    <Form.Label>Nome Prodotto</Form.Label>
                    <Form.Control
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder='Nome del prodotto'
                    />
                    <Form.Control.Feedback type='invalid'>
                      Il nome del prodotto è obbligatorio.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className='mb-3' controlId='brand'>
                    <Form.Label>Brand</Form.Label>
                    <Form.Select
                      name='brand'
                      value={formData.brand}
                      onChange={handleChange}
                      required
                    >
                      <option value=''>Seleziona brand</option>
                      {brands.map((brand, index) => (
                        <option key={index} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type='invalid'>
                      Il brand è obbligatorio.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className='mb-3' controlId='description'>
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={5}
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder='Descrizione del prodotto'
                />
                <Form.Control.Feedback type='invalid'>
                  La descrizione è obbligatoria.
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className='mb-3' controlId='categoryId'>
                    <Form.Label>Categoria</Form.Label>
                    <Form.Select
                      name='categoryId'
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value=''>Seleziona categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type='invalid'>
                      La categoria è obbligatoria.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className='mb-3' controlId='price'>
                    <Form.Label>Prezzo</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text>€</InputGroup.Text>
                      <Form.Control
                        type='number'
                        step='0.01'
                        min='0'
                        name='price'
                        value={formData.price}
                        onChange={handleChange}
                        required
                        placeholder='0.00'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Il prezzo è obbligatorio.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className='mb-3' controlId='releaseDate'>
                <Form.Label>Data di Rilascio</Form.Label>
                <Form.Control
                  type='date'
                  name='releaseDate'
                  value={formData.releaseDate}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type='invalid'>
                  La data di rilascio è obbligatoria.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Check
                  type='checkbox'
                  id='isDiscounted'
                  name='isDiscounted'
                  label='Prodotto in sconto'
                  checked={formData.isDiscounted}
                  onChange={handleChange}
                />
              </Form.Group>

              {formData.isDiscounted && (
                <Form.Group className='mb-3' controlId='discountPrice'>
                  <Form.Label>Prezzo Scontato</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>€</InputGroup.Text>
                    <Form.Control
                      type='number'
                      step='0.01'
                      min='0'
                      max={formData.price || 999999}
                      name='discountPrice'
                      value={formData.discountPrice}
                      onChange={handleChange}
                      required={formData.isDiscounted}
                      placeholder='0.00'
                    />
                    <Form.Control.Feedback type='invalid'>
                      Il prezzo scontato è obbligatorio e deve essere inferiore
                      al prezzo originale.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              )}

              <Form.Group className='mb-3'>
                <Form.Check
                  type='checkbox'
                  id='isFeatured'
                  name='isFeatured'
                  label='In evidenza nella Home Page'
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col lg={4}>
              <Card className='mb-4'>
                <Card.Header className='bg-white'>
                  <h6 className='mb-0'>Immagine Prodotto</h6>
                </Card.Header>
                <Card.Body className='text-center'>
                  {formData.imageUrl ? (
                    <div className='position-relative mb-3'>
                      <img
                        src={formData.imageUrl}
                        alt={formData.name || 'Preview'}
                        className='img-thumbnail'
                        style={{ maxHeight: '200px' }}
                      />
                      <Button
                        variant='outline-danger'
                        size='sm'
                        className='position-absolute top-0 end-0'
                        onClick={() => handleImageUpload('')}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  ) : (
                    <div className='upload-placeholder border rounded p-5 mb-3'>
                      <FaUpload size={48} className='text-muted mb-3' />
                      <p className='mb-0'>Carica un'immagine</p>
                    </div>
                  )}

                  <ImageUploader onUpload={handleImageUpload} />
                </Card.Body>
              </Card>

              <Card>
                <Card.Header className='bg-white'>
                  <h6 className='mb-0'>Taglie Disponibili</h6>
                </Card.Header>
                <Card.Body>
                  <p className='text-muted small mb-3'>
                    Inserisci la quantità disponibile per ogni taglia.
                  </p>

                  <Row>
                    {availableSizes.map((size) => {
                      const sizeData = sizes.find((s) => s.sizeId === size.id);
                      const stock = sizeData ? sizeData.stock : 0;

                      return (
                        <Col xs={6} key={size.id}>
                          <Form.Group
                            className='mb-3'
                            controlId={`size-${size.id}`}
                          >
                            <Form.Label>{size.name}</Form.Label>
                            <Form.Control
                              type='number'
                              min='0'
                              value={stock}
                              onChange={(e) => handleSizeChange(size.id, e)}
                              placeholder='0'
                            />
                          </Form.Group>
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className='d-flex justify-content-end gap-2 mt-4'>
            <Button
              variant='outline-secondary'
              onClick={onCancel}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button variant='primary' type='submit' disabled={loading}>
              {loading ? (
                <>
                  <span
                    className='spinner-border spinner-border-sm me-2'
                    role='status'
                    aria-hidden='true'
                  ></span>
                  Salvataggio...
                </>
              ) : (
                <>
                  <FaSave className='me-2' /> Salva Prodotto
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProductForm;
