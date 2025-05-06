import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaTag,
} from 'react-icons/fa';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import useAuth from '../../hooks/useAuth';
import { productService, orderService, categoryService } from '../../services';

const DashboardPage = () => {
  const { requireAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    ordersCount: 0,
    totalSales: 0,
    productsCount: 0,
    usersCount: 0,
    categoriesCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    requireAdmin(() => {
      fetchDashboardData();
    });
  }, [requireAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, ordersResponse, categoriesResponse] =
        await Promise.all([
          productService.getProducts(),
          orderService.getAllOrders(),
          categoryService.getCategories(),
        ]);

      const statsData = {
        productsCount: productsResponse?.length || 57,
        ordersCount: ordersResponse?.length || 0,
        totalSales:
          ordersResponse?.reduce(
            (total, order) => total + (order.totalAmount || 0),
            0
          ) || 0,
        usersCount: 15,
        categoriesCount: categoriesResponse?.length || 0,
      };

      const recentOrdersData = ordersResponse
        ? [...ordersResponse]
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5)
        : [];

      setStats(statsData);
      setRecentOrders(recentOrdersData);
    } catch (err) {
      console.error('Errore nel caricamento dei dati dashboard:', err);
      setError(
        'Si è verificato un errore nel caricamento dei dati della dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className='admin-container'>
        <Row>
          <Col md={2} className='admin-sidebar'>
            <AdminSidebar />
          </Col>
          <Col md={10} className='admin-content p-4'>
            <div className='text-center py-5'>
              <div className='spinner-border' role='status'>
                <span className='visually-hidden'>Caricamento...</span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className='admin-container'>
      <Row>
        <Col md={2} className='admin-sidebar'>
          <AdminSidebar />
        </Col>
        <Col md={10} className='admin-content p-4'>
          <AdminHeader title='Dashboard' />

          {error && <Alert variant='danger'>{error}</Alert>}

          <Row className='mb-4'>
            <Col md={4} className='mb-3'>
              <Card className='dashboard-card border-0 shadow-sm h-100'>
                <Card.Body className='d-flex'>
                  <div className='stats-icon bg-primary text-white'>
                    <FaShoppingCart size={24} />
                  </div>
                  <div className='ms-3'>
                    <h6 className='text-muted'>Ordini totali</h6>
                    <h2>{stats.ordersCount}</h2>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className='mb-3'>
              <Card className='dashboard-card border-0 shadow-sm h-100'>
                <Card.Body className='d-flex'>
                  <div className='stats-icon bg-success text-white'>
                    <FaChartLine size={24} />
                  </div>
                  <div className='ms-3'>
                    <h6 className='text-muted'>Vendite totali</h6>
                    <h2>€{stats.totalSales.toFixed(2)}</h2>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className='mb-3'>
              <Card className='dashboard-card border-0 shadow-sm h-100'>
                <Card.Body className='d-flex'>
                  <div className='stats-icon bg-info text-white'>
                    <FaBox size={24} />
                  </div>
                  <div className='ms-3'>
                    <h6 className='text-muted'>Prodotti</h6>
                    <h2>{stats.productsCount}</h2>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className='mb-3'>
              <Card className='dashboard-card border-0 shadow-sm h-100'>
                <Card.Body className='d-flex'>
                  <div className='stats-icon bg-warning text-white'>
                    <FaUsers size={24} />
                  </div>
                  <div className='ms-3'>
                    <h6 className='text-muted'>Utenti registrati</h6>
                    <h2>{stats.usersCount}</h2>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className='mb-3'>
              <Card className='dashboard-card border-0 shadow-sm h-100'>
                <Card.Body className='d-flex'>
                  <div className='stats-icon bg-danger text-white'>
                    <FaTag size={24} />
                  </div>
                  <div className='ms-3'>
                    <h6 className='text-muted'>Categorie</h6>
                    <h2>{stats.categoriesCount}</h2>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={12}>
              <Card className='border-0 shadow-sm'>
                <Card.Header className='bg-white'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <h5 className='mb-0'>Ordini recenti</h5>
                    <Button
                      variant='outline-primary'
                      size='sm'
                      onClick={() => navigate('/admin/orders')}
                    >
                      Vedi tutti
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className='table-responsive'>
                    <table className='table table-hover'>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Data</th>
                          <th>Totale</th>
                          <th>Stato</th>
                          <th>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.userFullName || 'Utente'}</td>
                            <td>
                              {new Date(order.orderDate).toLocaleDateString(
                                'it-IT'
                              )}
                            </td>
                            <td>€{order.totalAmount.toFixed(2)}</td>
                            <td>
                              <span
                                className={`badge ${
                                  order.status === 'Completato'
                                    ? 'bg-success'
                                    : order.status === 'Spedito'
                                    ? 'bg-info'
                                    : order.status === 'In lavorazione'
                                    ? 'bg-warning'
                                    : 'bg-secondary'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <Button
                                variant='link'
                                size='sm'
                                className='p-0 me-2'
                                onClick={() =>
                                  navigate(`/admin/orders/${order.id}`)
                                }
                              >
                                Dettagli
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
