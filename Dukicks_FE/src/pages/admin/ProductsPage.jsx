import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  InputGroup,
  Alert,
  Modal,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { productService, categoryService } from '../../services';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { requireAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    requireAdmin(() => {
      fetchProducts();
      fetchCategories();
    });
  }, [requireAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Inizio recupero prodotti per admin...');
      const productsList = await productService.getAllProductsForAdmin();
      console.log('Prodotti ricevuti nel componente:', productsList);

      if (Array.isArray(productsList)) {
        setProducts(productsList);
      } else {
        console.warn('Dati non validi ricevuti:', productsList);
        setProducts([]);
        setError('Formato dati non valido ricevuto dal server');
      }
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti:', err);
      setError(
        'Si è verificato un errore nel caricamento dei prodotti: ' +
          (err.message || err)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response || []);
    } catch (err) {
      console.error('Errore nel caricamento delle categorie:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await productService.deleteProduct(productToDelete.id);

      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);

      toast.success('Prodotto eliminato con successo!');
    } catch (err) {
      console.error("Errore nell'eliminazione del prodotto:", err);
      setError(
        err.message ||
          "Si è verificato un errore nell'eliminazione del prodotto."
      );

      if (err.message && err.message.includes('part of an order')) {
        toast.error(
          'Impossibile eliminare: il prodotto è associato a ordini esistenti'
        );
      } else {
        toast.error("Errore durante l'eliminazione del prodotto");
      }
    }
  };

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) =>
      selectedCategory
        ? product.categoryId === parseInt(selectedCategory)
        : true
    );

  return (
    <Container fluid className='admin-container'>
      <Row>
        <Col md={2} className='admin-sidebar'>
          <AdminSidebar />
        </Col>
        <Col md={10} className='admin-content p-4'>
          <AdminHeader
            title='Gestione Prodotti'
            breadcrumbs={[{ label: 'Prodotti' }]}
          />

          {error && (
            <Alert variant='danger' className='mb-4'>
              {error}
            </Alert>
          )}

          <Card className='border-0 shadow-sm mb-4'>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <div className='d-flex gap-3'>
                  <InputGroup style={{ width: '300px' }}>
                    <InputGroup.Text id='search-addon'>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder='Cerca prodotti...'
                      aria-label='Cerca prodotti'
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </InputGroup>

                  <Form.Select
                    style={{ width: '200px' }}
                    value={selectedCategory}
                    onChange={handleCategoryFilter}
                  >
                    <option value=''>Tutte le categorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <Button
                  variant='primary'
                  onClick={() => navigate('/admin/products/add')}
                >
                  <FaPlus className='me-2' /> Aggiungi Prodotto
                </Button>
              </div>

              {loading ? (
                <div className='text-center py-5'>
                  <div className='spinner-border' role='status'>
                    <span className='visually-hidden'>Caricamento...</span>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className='text-center py-5'>
                  <p className='mb-0'>Nessun prodotto trovato.</p>
                </div>
              ) : (
                <div className='table-responsive'>
                  <Table hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Brand</th>
                        <th>Categoria</th>
                        <th>Prezzo</th>
                        <th>Stato</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>#{product.id}</td>
                          <td>{product.name}</td>
                          <td>{product.brand}</td>
                          <td>
                            {categories.find((c) => c.id === product.categoryId)
                              ?.name || 'N/A'}
                          </td>
                          <td>
                            {product.isDiscounted ? (
                              <>
                                <span className='text-decoration-line-through text-muted me-2'>
                                  €{product.price.toFixed(2)}
                                </span>
                                <span className='text-danger'>
                                  €{product.discountPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>€{product.price.toFixed(2)}</span>
                            )}
                          </td>
                          <td>
                            <span className='badge bg-success'>
                              Disponibile
                            </span>
                          </td>
                          <td>
                            <Button
                              variant='outline-primary'
                              size='sm'
                              className='me-2'
                              onClick={() =>
                                navigate(`/admin/products/edit/${product.id}`)
                              }
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              onClick={() => handleDeleteClick(product)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modale di conferma eliminazione */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sei sicuro di voler eliminare il prodotto "{productToDelete?.name}"?
          <br />
          Questa azione non può essere annullata.
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
          <Button variant='danger' onClick={confirmDelete}>
            Elimina
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductsPage;
