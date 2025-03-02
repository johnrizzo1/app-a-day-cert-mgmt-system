import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { certificateApi } from '../services/api';

const CertificateDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [privateKey, setPrivateKey] = useState(null);
  const [privateKeyLoading, setPrivateKeyLoading] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const data = await certificateApi.getById(id);
      setCertificate(data);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      Alert.alert('Error', 'Failed to load certificate details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this certificate? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await certificateApi.delete(id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting certificate:', error);
              Alert.alert('Error', 'Failed to delete certificate. Please try again later.');
            }
          },
        },
      ]
    );
  };

  const handleGenerateCertificate = async () => {
    try {
      const data = await certificateApi.generate(id);
      setCertificate(data);
      Alert.alert('Success', 'Certificate generated successfully.');
    } catch (error) {
      console.error('Error generating certificate:', error);
      Alert.alert('Error', 'Failed to generate certificate. Please try again later.');
    }
  };

  const handleShowPrivateKey = async () => {
    try {
      setPrivateKeyLoading(true);
      const data = await certificateApi.getWithPrivateKey(id);
      setPrivateKey(data.private_key);
      setPrivateKeyVisible(true);
    } catch (error) {
      console.error('Error fetching private key:', error);
      Alert.alert('Error', 'Failed to fetch private key. Please try again later.');
    } finally {
      setPrivateKeyLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'revoked':
        return styles.statusRevoked;
      case 'expired':
        return styles.statusExpired;
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading certificate details...</Text>
      </View>
    );
  }

  if (!certificate) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Certificate not found.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.commonName}>{certificate.common_name}</Text>
          <View
            style={[styles.statusBadge, getStatusStyle(certificate.status)]}
          >
            <Text style={styles.statusText}>
              {certificate.status.charAt(0).toUpperCase() +
                certificate.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificate Information</Text>
          <View style={styles.infoContainer}>
            <InfoRow
              label="Common Name"
              value={certificate.common_name}
            />
            <InfoRow
              label="Organization"
              value={certificate.organization || 'Not specified'}
            />
            <InfoRow
              label="Organizational Unit"
              value={certificate.organizational_unit || 'Not specified'}
            />
            <InfoRow
              label="Country"
              value={certificate.country || 'Not specified'}
            />
            <InfoRow
              label="State/Province"
              value={certificate.state_province || 'Not specified'}
            />
            <InfoRow
              label="Locality"
              value={certificate.locality || 'Not specified'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Details</Text>
          <View style={styles.infoContainer}>
            <InfoRow
              label="Valid From"
              value={new Date(certificate.not_before).toLocaleString()}
            />
            <InfoRow
              label="Valid Until"
              value={new Date(certificate.not_valid_after).toLocaleString()}
            />
            <InfoRow
              label="Signature Algorithm"
              value={certificate.signature_algorithm}
            />
            <InfoRow
              label="Key Size"
              value={`${certificate.key_size} bits`}
            />
            <InfoRow
              label="Is CA"
              value={certificate.is_ca ? 'Yes' : 'No'}
            />
            <InfoRow
              label="Created"
              value={new Date(certificate.created_at).toLocaleString()}
            />
          </View>
        </View>

        {certificate.extensions && certificate.extensions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extensions</Text>
            <View style={styles.infoContainer}>
              {certificate.extensions.map((ext, index) => (
                <View key={index} style={styles.extension}>
                  <Text style={styles.extensionName}>
                    {ext.name}
                    {ext.critical && (
                      <Text style={styles.criticalText}> (Critical)</Text>
                    )}
                  </Text>
                  <Text style={styles.extensionOid}>OID: {ext.oid}</Text>
                  <Text style={styles.extensionValue}>
                    {JSON.stringify(ext.value, null, 2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {certificate.certificate_data ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificate Data</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.certificateData}>
                {certificate.certificate_data}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.warningText}>
              Certificate has not been generated yet.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleGenerateCertificate}
            >
              <Text style={styles.buttonText}>Generate Certificate</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleShowPrivateKey}
            disabled={privateKeyLoading}
          >
            <Text style={styles.buttonText}>
              {privateKeyLoading ? 'Loading...' : 'Show Private Key'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() =>
              navigation.navigate('CertificateEdit', { id: certificate.id })
            }
          >
            <Text style={styles.buttonText}>Edit Certificate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Delete Certificate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={privateKeyVisible}
        onRequestClose={() => setPrivateKeyVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Private Key</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPrivateKeyVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              This private key is sensitive information. Do not share it with
              unauthorized parties.
            </Text>
          </View>

          <ScrollView style={styles.privateKeyContainer}>
            <Text style={styles.privateKeyText}>{privateKey}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#2ecc71',
  },
  statusRevoked: {
    backgroundColor: '#e74c3c',
  },
  statusExpired: {
    backgroundColor: '#f39c12',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    flex: 1,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoValue: {
    flex: 2,
    color: '#7f8c8d',
  },
  extension: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  extensionName: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  criticalText: {
    color: '#e74c3c',
  },
  extensionOid: {
    color: '#7f8c8d',
    fontSize: 12,
    marginBottom: 4,
  },
  extensionValue: {
    fontFamily: 'Courier',
    fontSize: 12,
  },
  certificateData: {
    fontFamily: 'Courier',
    fontSize: 12,
  },
  warningText: {
    color: '#f39c12',
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#2ecc71',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c3e50',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 4,
    margin: 16,
  },
  privateKeyContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    margin: 16,
    padding: 16,
    borderRadius: 4,
  },
  privateKeyText: {
    fontFamily: 'Courier',
    fontSize: 12,
  },
});

export default CertificateDetailScreen;