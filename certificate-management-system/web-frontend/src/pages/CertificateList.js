import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Badge, Pagination, Alert, Modal } from 'react-bootstrap';
import { certificateApi } from '../services/api';

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const limit = 10;

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateApi.getAll(page, limit);
      setCertificates(data.certificates);
      setTotalPages(Math.ceil(data.total / limit));
      setError(null);
    } catch (err) {
      setError('Failed to fetch certificates. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDeleteClick = (certificate) => {
    setCertificateToDelete(certificate);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!certificateToDelete) return;
    
    try {
      setDeleteLoading(true);
      await certificateApi.delete(certificateToDelete.id);
      setShowDeleteModal(false);
      setCertificateToDelete(null);
      // Refresh the certificate list
      await fetchCertificates();
    } catch (err) {
      setError('Failed to delete certificate. Please try again later.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCertificateToDelete(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'revoked':
        return <Badge bg="danger">Revoked</Badge>;
      case 'expired':
        return <Badge bg="warning">Expired</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const renderPagination = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    return (
      <Pagination>
        <Pagination.Prev
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        />
        {items}
        <Pagination.Next
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        />
      </Pagination>
    );
  };

  if (loading && certificates.length === 0) {
    return <div className="text-center mt-5">Loading certificates...</div>;
  }

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Certificates</h1>
        <Button as={Link} to="/certificates/new" variant="primary">
          Create Certificate
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {certificates.length === 0 ? (
        <Alert variant="info">
          No certificates found. Click "Create Certificate" to add one.
        </Alert>
      ) : (
        <>
          <Row>
            {certificates.map((certificate) => (
              <Col key={certificate.id} md={6} lg={4} className="mb-4">
                <Card className="h-100 certificate-card">
                  <Card.Body>
                    <Card.Title>{certificate.common_name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {certificate.organization || 'No Organization'}
                    </Card.Subtitle>
                    <Card.Text>
                      <strong>Status:</strong> {getStatusBadge(certificate.status)}
                      <br />
                      <strong>Expires:</strong>{' '}
                      {new Date(certificate.not_valid_after).toLocaleDateString()}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between">
                    <Button
                      as={Link}
                      to={`/certificates/${certificate.id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(certificate)}
                    >
                      Delete
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-center mt-4">
            {renderPagination()}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the certificate for{' '}
          <strong>{certificateToDelete?.common_name}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CertificateList;