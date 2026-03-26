import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { SearchResult } from '../types';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';

// Main screens
import HomeScreen from '../screens/HomeScreen';
import AddPersonScreen from '../screens/AddPersonScreen';
import AddDetailsScreen from '../screens/AddDetailsScreen';
import EditDetailsScreen from '../screens/EditDetailsScreen';
import SearchQueryScreen from '../screens/SearchQueryScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import PersonDetailScreen from '../screens/PersonDetailScreen';
import ContactsListScreen from '../screens/ContactsListScreen';

export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  AddPerson: undefined;
  AddDetails: { personId?: string; name?: string };
  EditDetails: { personId: string };
  SearchQuery: undefined;
  SearchResults: { results: SearchResult[] };
  PersonDetail: { personId: string };
  ContactsList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading, isLoggedOutMode } = useAuth();
  
  console.log('🧭 AppNavigator render - user:', user?.email || 'NULL', 'isLoggedOutMode:', isLoggedOutMode, 'loading:', loading);

  if (loading) {
    console.log('⏳ AppNavigator - Still loading auth state');
    return null; // Or a loading screen
  }

  // Show main app if either user is logged in OR in logged out mode
  const isAppAccessible = !!user || isLoggedOutMode;
  console.log('📍 isAppAccessible:', isAppAccessible, '- showing', isAppAccessible ? 'APP' : 'LOGIN');

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: '#333',
        }}
      >
        {!isAppAccessible ? (
          // Auth stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen} 
              options={{ title: 'Forgot Password' }}
            />
          </>
        ) : (
          // Main app stack
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Name2Face', headerShown: true }}
            />
            <Stack.Screen 
              name="AddPerson" 
              component={AddPersonScreen}
              options={{ 
                title: 'New Name to Face',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="AddDetails" 
              component={AddDetailsScreen}
              options={{ 
                title: 'Add Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="EditDetails" 
              component={EditDetailsScreen}
              options={{ 
                title: 'Edit Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="SearchQuery" 
              component={SearchQueryScreen}
              options={{ 
                title: 'Recall Name to Face',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="SearchResults" 
              component={SearchResultsScreen}
              options={{ 
                title: 'Search Results',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="PersonDetail" 
              component={PersonDetailScreen}
              options={{ 
                title: 'Person Details',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="ContactsList" 
              component={ContactsListScreen}
              options={{ 
                title: 'My Contacts',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
