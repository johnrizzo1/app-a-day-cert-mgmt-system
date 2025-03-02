import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { certificateApi } from '../services/api';

const CertificateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Validation schema
  const validationSchema = Yup.object({
    common_name: Yup.string().required('Common Name is required'),
    organization: Yup.string(),
    organizational_unit: Yup.string(),
    country: Yup.string().max(2, 'Country code should be 2 characters'),
    state_province: Yup.string(),
    locality: Yup.string(),
    not_valid_after: Yup.date().required('Valid until date is required'),
    status: Yup.string().required('Status is required'),
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Convert dates to ISO format
      const formattedValues = {
        ...values,
        not_valid_after: new Date(values.not_valid_after).toISOString(),
      };

      const updatedCertificate = await certificateApi.update(id, formattedValues);
      navigate(`/certificates/${updatedCertificate.id}`);
    } catch (err) {
      setError('Failed to update certificate. Please try again later.');
      console.error(err);
    } finally {
      setSubmitting(false);
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

  // Format dates for form
  const initialValues = {
    ...certificate,
    not_valid_after: new Date(certificate.not_valid_after)
      .toISOString()
      .split('T')[0],
  };

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Edit Certificate</h1>
        <Button
          as={Link}
          to={`/certificates/${id}`}
          variant="outline-secondary"
        >
          Cancel
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleSubmit,
              handleChange,
              values,
              touched,
              errors,
              isSubmitting,
            }) => (
              <Form onSubmit={handleSubmit} className="form-container">
                <h4 className="mb-3">Certificate Information</h4>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="common_name">
                      <Form.Label>Common Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="common_name"
                        value={values.common_name}
                        onChange={handleChange}
                        isInvalid={touched.common_name && !!errors.common_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.common_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="organization">
                      <Form.Label>Organization</Form.Label>
                      <Form.Control
                        type="text"
                        name="organization"
                        value={values.organization || ''}
                        onChange={handleChange}
                        isInvalid={touched.organization && !!errors.organization}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.organization}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="organizational_unit">
                      <Form.Label>Organizational Unit</Form.Label>
                      <Form.Control
                        type="text"
                        name="organizational_unit"
                        value={values.organizational_unit || ''}
                        onChange={handleChange}
                        isInvalid={
                          touched.organizational_unit &&
                          !!errors.organizational_unit
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.organizational_unit}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="country">
                      <Form.Label>Country (2-letter code)</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={values.country || ''}
                        onChange={handleChange}
                        isInvalid={touched.country && !!errors.country}
                        maxLength={2}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.country}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="state_province">
                      <Form.Label>State/Province</Form.Label>
                      <Form.Control
                        type="text"
                        name="state_province"
                        value={values.state_province || ''}
                        onChange={handleChange}
                        isInvalid={
                          touched.state_province && !!errors.state_province
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.state_province}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="locality">
                      <Form.Label>Locality/City</Form.Label>
                      <Form.Control
                        type="text"
                        name="locality"
                        value={values.locality || ''}
                        onChange={handleChange}
                        isInvalid={touched.locality && !!errors.locality}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.locality}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <h4 className="mb-3 mt-4">Certificate Settings</h4>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="not_valid_after">
                      <Form.Label>Valid Until *</Form.Label>
                      <Form.Control
                        type="date"
                        name="not_valid_after"
                        value={values.not_valid_after}
                        onChange={handleChange}
                        isInvalid={
                          touched.not_valid_after && !!errors.not_valid_after
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.not_valid_after}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="status">
                      <Form.Label>Status *</Form.Label>
                      <Form.Select
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        isInvalid={touched.status && !!errors.status}
                      >
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                        <option value="expired">Expired</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.status}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Alert variant="info">
                  Note: Some certificate properties cannot be changed after
                  creation (e.g., key size, signature algorithm, valid from date).
                </Alert>

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="secondary"
                    as={Link}
                    to={`/certificates/${id}`}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CertificateEdit;