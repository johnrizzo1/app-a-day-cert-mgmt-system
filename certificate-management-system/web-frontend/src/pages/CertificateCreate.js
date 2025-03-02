import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Formik, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { certificateApi } from '../services/api';

const CertificateCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Calculate default dates
  const today = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(today.getFullYear() + 1);

  // Initial form values
  const initialValues = {
    common_name: '',
    organization: '',
    organizational_unit: '',
    country: '',
    state_province: '',
    locality: '',
    not_before: today.toISOString().split('T')[0],
    not_valid_after: oneYearLater.toISOString().split('T')[0],
    signature_algorithm: 'sha256',
    key_size: 2048,
    is_ca: false,
    status: 'active',
    extensions: [],
  };

  // Validation schema
  const validationSchema = Yup.object({
    common_name: Yup.string().required('Common Name is required'),
    organization: Yup.string(),
    organizational_unit: Yup.string(),
    country: Yup.string().max(2, 'Country code should be 2 characters'),
    state_province: Yup.string(),
    locality: Yup.string(),
    not_before: Yup.date().required('Valid from date is required'),
    not_valid_after: Yup.date()
      .required('Valid until date is required')
      .min(
        Yup.ref('not_before'),
        'Valid until date must be after valid from date'
      ),
    signature_algorithm: Yup.string().required('Signature algorithm is required'),
    key_size: Yup.number()
      .required('Key size is required')
      .oneOf([1024, 2048, 4096], 'Key size must be 1024, 2048, or 4096'),
    is_ca: Yup.boolean(),
    status: Yup.string().required('Status is required'),
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Convert dates to ISO format
      const formattedValues = {
        ...values,
        not_before: new Date(values.not_before).toISOString(),
        not_valid_after: new Date(values.not_valid_after).toISOString(),
      };

      const certificate = await certificateApi.create(formattedValues);
      navigate(`/certificates/${certificate.id}`);
    } catch (err) {
      setError('Failed to create certificate. Please try again later.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Create Certificate</h1>
        <Button as={Link} to="/certificates" variant="outline-secondary">
          Cancel
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

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
                      <Form.Text className="text-muted">
                        Domain name or server name
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="organization">
                      <Form.Label>Organization</Form.Label>
                      <Form.Control
                        type="text"
                        name="organization"
                        value={values.organization}
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
                        value={values.organizational_unit}
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
                        value={values.country}
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
                        value={values.state_province}
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
                        value={values.locality}
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
                    <Form.Group controlId="not_before">
                      <Form.Label>Valid From *</Form.Label>
                      <Form.Control
                        type="date"
                        name="not_before"
                        value={values.not_before}
                        onChange={handleChange}
                        isInvalid={touched.not_before && !!errors.not_before}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.not_before}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
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
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="signature_algorithm">
                      <Form.Label>Signature Algorithm *</Form.Label>
                      <Form.Select
                        name="signature_algorithm"
                        value={values.signature_algorithm}
                        onChange={handleChange}
                        isInvalid={
                          touched.signature_algorithm &&
                          !!errors.signature_algorithm
                        }
                      >
                        <option value="sha256">SHA-256</option>
                        <option value="sha384">SHA-384</option>
                        <option value="sha512">SHA-512</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.signature_algorithm}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="key_size">
                      <Form.Label>Key Size (bits) *</Form.Label>
                      <Form.Select
                        name="key_size"
                        value={values.key_size}
                        onChange={handleChange}
                        isInvalid={touched.key_size && !!errors.key_size}
                      >
                        <option value={1024}>1024</option>
                        <option value={2048}>2048</option>
                        <option value={4096}>4096</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.key_size}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="is_ca">
                      <Form.Check
                        type="checkbox"
                        label="Is Certificate Authority (CA)"
                        name="is_ca"
                        checked={values.is_ca}
                        onChange={handleChange}
                      />
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

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="secondary"
                    as={Link}
                    to="/certificates"
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Certificate'}
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

export default CertificateCreate;