import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { personService } from '../services/personService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { signOut, user, isLoggedOutMode, enterLoggedOutMode, exitLoggedOutMode } = useAuth();

  const handleSignOut = async () => {
    console.log('🔴 LOGOUT BUTTON CLICKED - handleSignOut called');
    console.log('signOut function type:', typeof signOut);
    
    const confirmLogout = (typeof window !== 'undefined') && window.confirm('Sign out? You will need to login again.');
    console.log('User confirmed logout:', confirmLogout);
    
    if (!confirmLogout) {
      console.log('User cancelled logout');
      return;
    }

    try {
      console.log('🔴 >>> Starting logout process');
      personService.setLoggedOutMode(false);
      console.log('✅ >>> Logged out mode disabled');
      
      console.log('🔴 >>> Calling signOut()');
      const result = await signOut();
      console.log('✅ >>> Sign out completed, result:', result);
      console.log('✅ >>> User should now be null, current user:', user);
    } catch (error: any) {
      console.error('❌ >>> Sign out error:', error);
      console.error('Error details:', error.message, error.code);
    }
  };

  const handleEnterLoggedOutMode = () => {
    Alert.alert(
      'Logged Out Mode',
      'Enter logged out mode? You can add and view contacts locally, but changes won\'t sync to the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter Logged Out Mode',
          style: 'default',
          onPress: () => {
            personService.setLoggedOutMode(true);
            enterLoggedOutMode();
          },
        },
      ]
    );
  };

  const handleExitLoggedOutMode = async () => {
    try {
      personService.setLoggedOutMode(false);
      await exitLoggedOutMode();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to exit offline mode');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with user info and logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Name2Face</Text>
          {user && (
            <Text style={styles.headerUserInfo}>
              {user.email}
            </Text>
          )}
          {isLoggedOutMode && (
            <Text style={styles.headerOfflineInfo}>
              📱 Logged Out Mode
            </Text>
          )}
        </View>
        {user && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
        {isLoggedOutMode && !user && (
          <TouchableOpacity
            style={[styles.logoutButton, styles.exitOfflineButton]}
            onPress={handleExitLoggedOutMode}
          >
            <Text style={styles.logoutButtonText}>Exit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Never forget a name or face again</Text>

          <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.card, styles.primaryCard]}
            onPress={() => navigation.navigate('AddDetails', { name: '' })}
          >
            <Text style={styles.cardIcon}>👤➕</Text>
            <Text style={styles.cardTitle}>New Name to Face</Text>
            <Text style={styles.cardDescription}>
              Add a new person to remember
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.secondaryCard]}
            onPress={() => navigation.navigate('SearchQuery')}
          >
            <Text style={styles.cardIcon}>👤❓</Text>
            <Text style={styles.cardTitle}>Recall Name to Face</Text>
            <Text style={styles.cardDescription}>
              Search for someone you've met
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.tertiaryCard]}
            onPress={() => navigation.navigate('ContactsList')}
          >
            <Text style={styles.cardIcon}>👥</Text>
            <Text style={styles.cardTitle}>View Contacts</Text>
            <Text style={styles.cardDescription}>
              See all your saved contacts
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerButtons}>
          {isLoggedOutMode ? (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleExitLoggedOutMode}
            >
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
          ) : !user ? (
            <TouchableOpacity
              style={[styles.button, styles.offlineButton]}
              onPress={handleEnterLoggedOutMode}
            >
              <Text style={styles.buttonText}>Try Logged Out Mode</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerUserInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  headerOfflineInfo: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  exitOfflineButton: {
    backgroundColor: '#5856D6',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    overflow: 'scroll',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  userInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#999',
  },
  buttonsContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  secondaryCard: {
    borderColor: '#34C759',
    borderWidth: 2,
  },
  tertiaryCard: {
    borderColor: '#5856D6',
    borderWidth: 2,
  },
  cardIcon: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerButtons: {
    marginTop: 40,
    gap: 12,
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: '#E8E8E8',
  },
  offlineButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default HomeScreen;
