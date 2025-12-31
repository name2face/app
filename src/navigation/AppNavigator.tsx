import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { SearchResult } from '../types';

// Auth screens
import LoginScreen from '../screens/LoginScreen';

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
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // Auth stack
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          // Main app stack
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Name2Face' }}
            />
            <Stack.Screen 
              name="AddPerson" 
              component={AddPersonScreen}
              options={{ title: 'New Name to Face' }}
            />
            <Stack.Screen 
              name="AddDetails" 
              component={AddDetailsScreen}
              options={{ title: 'Add Details' }}
            />
            <Stack.Screen 
              name="EditDetails" 
              component={EditDetailsScreen}
              options={{ title: 'Edit Details' }}
            />
            <Stack.Screen 
              name="SearchQuery" 
              component={SearchQueryScreen}
              options={{ title: 'Recall Name to Face' }}
            />
            <Stack.Screen 
              name="SearchResults" 
              component={SearchResultsScreen}
              options={{ title: 'Search Results' }}
            />
            <Stack.Screen 
              name="PersonDetail" 
              component={PersonDetailScreen}
              options={{ title: 'Person Details' }}
            />
            <Stack.Screen 
              name="ContactsList" 
              component={ContactsListScreen}
              options={{ title: 'My Contacts' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
