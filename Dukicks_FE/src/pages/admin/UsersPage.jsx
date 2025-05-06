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
  InputGroup,
  Alert,
  Spinner,
  Modal,
} from 'react-bootstrap';
import { FaSearch, FaEdit, FaLock, FaUnlock, FaTrash } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { authService } from '../../services';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const UsersPage = () => {
  const { requireAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    requireAdmin(() => {
      fetchUsers();
    });
  }, [requireAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.getAllUsers();
      setUsers(response || []);
    } catch (err) {
      console.error('Errore nel caricamento degli utenti:', err);
      setError('Si è verificato un errore nel caricamento degli utenti.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Errore nell'eliminazione dell'utente:", err);
      setError("Si è verificato un errore nell'eliminazione dell'utente.");
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
            title='Gestione Utenti'
            breadcrumbs={[{ label: 'Utenti' }]}
          />

          {error && (
            <Alert variant='danger' className='mb-4'>
              {error}
            </Alert>
          )}

          <Card className='border-0 shadow-sm mb-4'>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <Form onSubmit={handleSearch} className='d-flex'>
                  <InputGroup style={{ width: '300px' }}>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder='Cerca utenti...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Form>
              </div>

              {loading ? (
                <div className='text-center py-5'>
                  <Spinner animation='border' role='status'>
                    <span className='visually-hidden'>Caricamento...</span>
                  </Spinner>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className='text-center py-5'>
                  <p className='mb-0'>Nessun utente trovato.</p>
                </div>
              ) : (
                <>
                  <div className='table-responsive'>
                    <Table hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nome</th>
                          <th>Email</th>
                          <th>Ruolo</th>
                          <th>Stato</th>
                          <th>Data Registrazione</th>
                          <th>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{`${user.firstName} ${user.lastName}`}</td>
                            <td>{user.email}</td>
                            <td>
                              <Badge
                                bg={
                                  user.role === 'Admin'
                                    ? 'primary'
                                    : 'secondary'
                                }
                              >
                                {user.role || 'Utente'}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={user.isActive ? 'success' : 'danger'}>
                                {user.isActive ? 'Attivo' : 'Disattivato'}
                              </Badge>
                            </td>
                            <td>
                              {new Date(user.createdAt).toLocaleDateString(
                                'it-IT'
                              )}
                            </td>
                            <td>
                              <Button
                                variant='outline-primary'
                                size='sm'
                                className='me-2'
                                title='Modifica utente'
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant={
                                  user.isActive
                                    ? 'outline-warning'
                                    : 'outline-success'
                                }
                                size='sm'
                                className='me-2'
                                title={
                                  user.isActive
                                    ? 'Disattiva utente'
                                    : 'Attiva utente'
                                }
                              >
                                {user.isActive ? <FaLock /> : <FaUnlock />}
                              </Button>
                              <Button
                                variant='outline-danger'
                                size='sm'
                                title='Elimina utente'
                                onClick={() => handleDeleteClick(user)}
                              >
                                <FaTrash />
                              </Button>
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

      {/* Modale di conferma eliminazione */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sei sicuro di voler eliminare l'utente "{userToDelete?.firstName}{' '}
          {userToDelete?.lastName}"?
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

export default UsersPage;
