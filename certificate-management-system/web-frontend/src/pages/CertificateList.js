import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Badge, Pagination, Alert } from 'react-bootstrap';
import { certificateApi } from '../services/api';

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
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

    fetchCertificates();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
                  <Card.Footer>
                    <Button
                      as={Link}
                      to={`/certificates/${certificate.id}`}
                      variant="outline-primary"
                      size="sm"
                    >
                      View Details
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
    </div>
  );
};

export default CertificateList;