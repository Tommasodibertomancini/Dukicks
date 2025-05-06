import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaSearch,
  FaEye,
  FaArrowLeft,
  FaFileInvoice,
  FaBan,
} from 'react-icons/fa';
import { fetchUserOrders, cancelOrder } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { orders, isLoading, error } = useSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = più recenti prima

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/orders' } } });
      return;
    }

    dispatch(fetchUserOrders());
  }, [isAuthenticated, navigate, dispatch]);

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Sei sicuro di voler annullare questo ordine?')) {
      dispatch(cancelOrder(orderId))
        .unwrap()
        .then(() => {
          toast.success('Ordine annullato con successo');
        })
        .catch((err) => {
          toast.error(err || "Errore durante l'annullamento dell'ordine");
        });
    }
  };
  const getFilteredOrders = () => {
    if (!orders || orders.length === 0) return [];

    return orders
      .filter((order) => {
        if (statusFilter !== 'all') {
          const orderStatus = order.status?.toLowerCase();
          if (orderStatus !== statusFilter.toLowerCase()) {
            return false;
          }
        }

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const orderIdMatch = order.id?.toString().includes(searchLower);
          const productsMatch = order.items?.some((item) =>
            (item.productName || item.name)?.toLowerCase().includes(searchLower)
          );

          return orderIdMatch || productsMatch;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.orderDate || a.createdAt || 0);
        const dateB = new Date(b.orderDate || b.createdAt || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge bg='secondary'>Sconosciuto</Badge>;

    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
      case 'confermato':
        return <Badge bg='success'>Confermato</Badge>;
      case 'processing':
      case 'in lavorazione':
        return <Badge bg='info'>In lavorazione</Badge>;
      case 'shipped':
      case 'spedito':
        return <Badge bg='primary'>Spedito</Badge>;
      case 'delivered':
      case 'consegnato':
        return <Badge bg='success'>Consegnato</Badge>;
      case 'cancelled':
      case 'canceled':
      case 'annullato':
        return <Badge bg='danger'>Annullato</Badge>;
      default:
        return <Badge bg='secondary'>{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data non disponibile';

    try {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('it-IT', options);
    } catch (e) {
      console.error('Errore formattazione data:', e);
      return 'Data non valida';
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00';
    return typeof price === 'number'
      ? price.toFixed(2)
      : parseFloat(price).toFixed(2);
  };

  const filteredOrders = getFilteredOrders();

  if (isLoading) {
    return (
      <Container className='my-5 text-center'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Caricamento ordini...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className='my-5 orders-container'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <div>
          <h1 className='mb-0'>I miei ordini</h1>
          <p className='text-muted'>
            Visualizza e monitora tutti i tuoi acquisti
          </p>
        </div>
        <Button as={Link} to='/profile' variant='outline-secondary'>
          <FaArrowLeft className='me-2' /> Torna al profilo
        </Button>
      </div>

      {error && (
        <Alert variant='danger' className='mb-4'>
          {error}
        </Alert>
      )}

      <Card className='mb-4 orders-card'>
        <Card.Body>
          <Row className='align-items-center g-3'>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type='search'
                  placeholder='Cerca per numero ordine'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value='all'>Tutti gli stati</option>
                <option value='pending'>Confermato</option>
                <option value='processing'>In lavorazione</option>
                <option value='shipped'>Spedito</option>
                <option value='delivered'>Consegnato</option>
                <option value='cancelled'>Annullato</option>
              </Form.Select>
            </Col>
            <Col md={4} className='text-md-end'>
              <Form.Check
                type='switch'
                id='date-sort-switch'
                label='Ordini più vecchi prima'
                checked={sortOrder === 'asc'}
                onChange={() =>
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                }
                className='d-inline-block me-2'
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredOrders.length === 0 ? (
        <Card className='text-center p-5 mt-4 orders-card'>
          <Card.Body>
            {orders?.length > 0 ? (
              <>
                <div className='mb-3'>
                  <FaSearch
                    size={40}
                    className='text-muted orders-empty-icon'
                  />
                </div>
                <h4>Nessun ordine trovato</h4>
                <p className='text-muted'>
                  Non ci sono ordini che corrispondono ai criteri di ricerca.
                </p>
              </>
            ) : (
              <>
                <div className='mb-3'>
                  <FaFileInvoice
                    size={40}
                    className='text-muted orders-empty-icon'
                  />
                </div>
                <h4>Non hai ancora effettuato ordini</h4>
                <p className='text-muted'>
                  Inizia a fare acquisti per vedere i tuoi ordini qui.
                </p>
                <Button
                  as={Link}
                  to='/products'
                  variant='primary'
                  className='mt-3'
                >
                  Sfoglia i prodotti
                </Button>
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className='orders-card'>
          <Table responsive hover className='mb-0 orders-table'>
            <thead>
              <tr>
                <th>Ordine #</th>
                <th>Data</th>
                <th>Prodotti</th>
                <th>Totale</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                  </td>
                  <td>{formatDate(order.orderDate || order.createdAt)}</td>
                  <td>
                    {order.items?.map((item, index) => (
                      <div key={index} className='mb-1'>
                        {item.productName || item.name} ({item.quantity})
                        {index < order.items.length - 1 && (
                          <hr className='my-1' />
                        )}
                      </div>
                    ))}
                  </td>
                  <td>
                    €
                    {formatPrice(
                      order.totalAmount ||
                        order.TotalAmount ||
                        order.total ||
                        (order.items && order.items.length > 0
                          ? order.items.reduce(
                              (sum, item) =>
                                sum + item.unitPrice * item.quantity,
                              0
                            )
                          : 0)
                    )}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className='d-flex'>
                    <Button
                      as={Link}
                      to={`/thank-you?orderId=${order.id}`}
                      variant='outline-primary'
                      size='sm'
                      className='me-2'
                    >
                      <FaEye /> Dettagli
                    </Button>

                    {(order.status?.toLowerCase() === 'pending' ||
                      order.status?.toLowerCase() === 'in attesa') && (
                      <Button
                        variant='outline-danger'
                        size='sm'
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <FaBan /> Annulla
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
};

export default OrdersPage;
