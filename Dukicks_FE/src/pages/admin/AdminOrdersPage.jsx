import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Form,
  Button,
  Dropdown,
  InputGroup,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye, FaEdit } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { orderService } from '../../services';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const OrdersPage = () => {
  const { requireAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    requireAdmin(() => {
      fetchOrders();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getAllOrders(filterStatus || null);
      setOrders(response || []);
    } catch (err) {
      console.error('Errore nel caricamento degli ordini:', err);
      setError('Si è verificato un errore nel caricamento degli ordini.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const filteredOrders = orders.filter(
    (order) =>
      order.userFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completato':
        return <Badge bg='success'>Completato</Badge>;
      case 'Spedito':
        return <Badge bg='info'>Spedito</Badge>;
      case 'In lavorazione':
        return <Badge bg='warning'>In lavorazione</Badge>;
      case 'Annullato':
        return <Badge bg='danger'>Annullato</Badge>;
      default:
        return <Badge bg='secondary'>{status}</Badge>;
    }
  };

  return (
    <Container fluid className='admin-container'>
      <Row>
        <Col md={2} className='admin-sidebar'>
          <AdminSidebar />
        </Col>
        <Col md={10} className='admin-content p-4'>
          <AdminHeader
            title='Gestione Ordini'
            breadcrumbs={[{ label: 'Ordini' }]}
          />

          {error && (
            <Alert variant='danger' className='mb-4'>
              {error}
            </Alert>
          )}

          <Card className='border-0 shadow-sm mb-4'>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center mb-4 flex-wrap'>
                <Form onSubmit={handleSearch} className='d-flex mb-2 mb-md-0'>
                  <InputGroup style={{ width: '300px' }}>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder='Cerca ordini...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Form>

                <div className='d-flex gap-2'>
                  <Form.Select
                    style={{ width: '200px' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value=''>Tutti gli stati</option>
                    <option value='In lavorazione'>In lavorazione</option>
                    <option value='Spedito'>Spedito</option>
                    <option value='Completato'>Completato</option>
                    <option value='Annullato'>Annullato</option>
                  </Form.Select>
                </div>
              </div>

              {loading ? (
                <div className='text-center py-5'>
                  <Spinner animation='border' role='status'>
                    <span className='visually-hidden'>Caricamento...</span>
                  </Spinner>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className='text-center py-5'>
                  <p className='mb-0'>Nessun ordine trovato.</p>
                </div>
              ) : (
                <>
                  <div className='table-responsive'>
                    <Table hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Data</th>
                          <th>Totale</th>
                          <th>Stato</th>
                          <th>Pagamento</th>
                          <th>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.userFullName}</td>
                            <td>
                              {new Date(order.orderDate).toLocaleDateString(
                                'it-IT'
                              )}
                            </td>
                            <td>€{order.totalAmount.toFixed(2)}</td>
                            <td>{getStatusBadge(order.status)}</td>
                            <td>
                              <Badge
                                bg={
                                  order.paymentStatus === 'Pagato'
                                    ? 'success'
                                    : 'warning'
                                }
                              >
                                {order.paymentStatus}
                              </Badge>
                            </td>
                            <td>
                              <Link
                                to={`/admin/orders/${order.id}`}
                                className='btn btn-sm btn-outline-primary me-2'
                              >
                                <FaEye /> Dettagli
                              </Link>
                              <Link
                                to={`/admin/orders/edit/${order.id}`}
                                className='btn btn-sm btn-outline-secondary'
                              >
                                <FaEdit /> Modifica
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Paginazione */}
                  {totalPages > 1 && (
                    <div className='d-flex justify-content-center mt-4'>
                      <ul className='pagination'>
                        <li
                          className={`page-item ${
                            currentPage === 1 ? 'disabled' : ''
                          }`}
                        >
                          <button
                            className='page-link'
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Precedente
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li
                            key={i}
                            className={`page-item ${
                              currentPage === i + 1 ? 'active' : ''
                            }`}
                          >
                            <button
                              className='page-link'
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        <li
                          className={`page-item ${
                            currentPage === totalPages ? 'disabled' : ''
                          }`}
                        >
                          <button
                            className='page-link'
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Successivo
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrdersPage;
