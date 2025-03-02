import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { certificateApi } from '../services/api';

const CertificateListScreen = ({ navigation }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchCertificates = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const data = await certificateApi.getAll(pageNum, limit);
      
      if (shouldRefresh || pageNum === 1) {
        setCertificates(data.certificates);
      } else {
        setCertificates((prev) => [...prev, ...data.certificates]);
      }
      
      setHasMore(data.certificates.length === limit);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      Alert.alert('Error', 'Failed to load certificates. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
    
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCertificates(1, true);
    });

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    fetchCertificates(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchCertificates(page + 1);
    }
  };

  const renderCertificateItem = ({ item }) => {
    const expiryDate = new Date(item.not_valid_after).toLocaleDateString();
    
    return (
      <TouchableOpacity
        style={styles.certificateItem}
        onPress={() => navigation.navigate('CertificateDetail', { id: item.id })}
      >
        <View style={styles.certificateContent}>
          <Text style={styles.commonName}>{item.common_name}</Text>
          <Text style={styles.organization}>
            {item.organization || 'No Organization'}
          </Text>
          <View style={styles.detailsRow}>
            <Text style={styles.expiryDate}>Expires: {expiryDate}</Text>
            <View
              style={[
                styles.statusBadge,
                item.status === 'active'
                  ? styles.statusActive
                  : item.status === 'revoked'
                  ? styles.statusRevoked
                  : styles.statusExpired,
              ]}
            >
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && certificates.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading certificates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Certificates</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CertificateCreate')}
        >
          <Text style={styles.addButtonText}>+ Create Certificate</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={certificates}
        renderItem={renderCertificateItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No certificates found. Click "Create Certificate" to add one.
            </Text>
          </View>
        }
        ListFooterComponent={
          loading && certificates.length > 0 ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#2c3e50" />
              <Text style={styles.footerText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  certificateItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  certificateContent: {
    padding: 16,
  },
  commonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  organization: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryDate: {
    fontSize: 14,
    color: '#7f8c8d',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#7f8c8d',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7f8c8d',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 8,
    color: '#7f8c8d',
  },
});

export default CertificateListScreen;