import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CertificateListScreen from './screens/CertificateListScreen';
import CertificateDetailScreen from './screens/CertificateDetailScreen';
import CertificateCreateScreen from './screens/CertificateCreateScreen';
import CertificateEditScreen from './screens/CertificateEditScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CertificateList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="CertificateList"
          component={CertificateListScreen}
          options={{ title: 'Certificates' }}
        />
        <Stack.Screen
          name="CertificateDetail"
          component={CertificateDetailScreen}
          options={{ title: 'Certificate Details' }}
        />
        <Stack.Screen
          name="CertificateCreate"
          component={CertificateCreateScreen}
          options={{ title: 'Create Certificate' }}
        />
        <Stack.Screen
          name="CertificateEdit"
          component={CertificateEditScreen}
          options={{ title: 'Edit Certificate' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;