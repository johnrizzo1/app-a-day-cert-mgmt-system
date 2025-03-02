import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Row, Col, Badge, Alert, Modal } from 'react-bootstrap';
import { certificateApi } from '../services/api';

const CertificateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [privateKey, setPrivateKey] = useState(null);
  const [privateKeyLoading, setPrivateKeyLoading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const data = await certificateApi.getById(id);
        setCertificate(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch certificate details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const handleDelete = async () => {
    try {
      await certificateApi.delete(id);
      navigate('/certificates');
    } catch (err) {
      setError('Failed to delete certificate. Please try again later.');
      console.error(err);
    }
    setShowDeleteModal(false);
  };

  const handleGenerateCertificate = async () => {
    try {
      const data = await certificateApi.generate(id);
      setCertificate(data);
    } catch (err) {
      setError('Failed to generate certificate. Please try again later.');
      console.error(err);
    }
  };

  const handleShowPrivateKey = async () => {
    try {
      setPrivateKeyLoading(true);
      const data = await certificateApi.getWithPrivateKey(id);
      setPrivateKey(data.private_key);
      setShowPrivateKeyModal(true);
    } catch (err) {
      setError('Failed to fetch private key. Please try again later.');
      console.error(err);
    } finally {
      setPrivateKeyLoading(false);
    }
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

  if (loading) {
    return <div className="text-center mt-5">Loading certificate details...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!certificate) {
    return <Alert variant="warning">Certificate not found.</Alert>;
  }

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Certificate Details</h1>
        <div>
          <Button
            as={Link}
            to="/certificates"
            variant="outline-secondary"
            className="me-2"
          >
            Back to List
          </Button>
          <Button
            as={Link}
            to={`/certificates/${id}/edit`}
            variant="outline-primary"
            className="me-2"
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <h3>{certificate.common_name}</h3>
          <div>{getStatusBadge(certificate.status)}</div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h4>Certificate Information</h4>
              <div className="certificate-detail">
                <p>
                  <strong>Common Name:</strong> {certificate.common_name}
                </p>
                <p>
                  <strong>Organization:</strong>{' '}
                  {certificate.organization || 'Not specified'}
                </p>
                <p>
                  <strong>Organizational Unit:</strong>{' '}
                  {certificate.organizational_unit || 'Not specified'}
                </p>
                <p>
                  <strong>Country:</strong> {certificate.country || 'Not specified'}
                </p>
                <p>
                  <strong>State/Province:</strong>{' '}
                  {certificate.state_province || 'Not specified'}
                </p>
                <p>
                  <strong>Locality:</strong> {certificate.locality || 'Not specified'}
                </p>
              </div>
            </Col>
            <Col md={6}>
              <h4>Technical Details</h4>
              <div className="certificate-detail">
                <p>
                  <strong>Valid From:</strong>{' '}
                  {new Date(certificate.not_before).toLocaleString()}
                </p>
                <p>
                  <strong>Valid Until:</strong>{' '}
                  {new Date(certificate.not_valid_after).toLocaleString()}
                </p>
                <p>
                  <strong>Signature Algorithm:</strong>{' '}
                  {certificate.signature_algorithm}
                </p>
                <p>
                  <strong>Key Size:</strong> {certificate.key_size} bits
                </p>
                <p>
                  <strong>Is CA:</strong> {certificate.is_ca ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Created:</strong>{' '}
                  {new Date(certificate.created_at).toLocaleString()}
                </p>
              </div>
            </Col>
          </Row>

          {certificate.extensions && certificate.extensions.length > 0 && (
            <div className="mt-4">
              <h4>Extensions</h4>
              <div className="certificate-detail">
                {certificate.extensions.map((ext, index) => (
                  <div key={index} className="mb-3">
                    <p>
                      <strong>{ext.name}</strong>{' '}
                      {ext.critical && <Badge bg="warning">Critical</Badge>}
                    </p>
                    <p>
                      <strong>OID:</strong> {ext.oid}
                    </p>
                    <pre>{JSON.stringify(ext.value, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificate.certificate_data ? (
            <div className="mt-4">
              <h4>Certificate Data</h4>
              <div className="certificate-detail">
                <pre>{certificate.certificate_data}</pre>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Alert variant="warning">
                Certificate has not been generated yet.
              </Alert>
              <Button
                variant="primary"
                onClick={handleGenerateCertificate}
              >
                Generate Certificate
              </Button>
            </div>
          )}

          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={handleShowPrivateKey}
              disabled={privateKeyLoading}
            >
              {privateKeyLoading ? 'Loading...' : 'Show Private Key'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this certificate? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Private Key Modal */}
      <Modal
        show={showPrivateKeyModal}
        onHide={() => setShowPrivateKeyModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Private Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            This private key is sensitive information. Do not share it with
            unauthorized parties.
          </Alert>
          <pre className="bg-light p-3">{privateKey}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPrivateKeyModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CertificateDetail;