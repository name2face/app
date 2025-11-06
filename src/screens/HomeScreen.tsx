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

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Name2Face</Text>
        <Text style={styles.subtitle}>
          Never forget a name again
        </Text>

        {user && (
          <Text style={styles.userInfo}>
            Signed in as: {user.email}
          </Text>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.card, styles.primaryCard]}
            onPress={() => navigation.navigate('AddPerson')}
          >
            <Text style={styles.cardIcon}>+</Text>
            <Text style={styles.cardTitle}>New Name to Face</Text>
            <Text style={styles.cardDescription}>
              Add a new person to remember
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.secondaryCard]}
            onPress={() => navigation.navigate('SearchQuery')}
          >
            <Text style={styles.cardIcon}>?</Text>
            <Text style={styles.cardTitle}>Recall Name to Face</Text>
            <Text style={styles.cardDescription}>
              Search for someone you've met
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
  signOutButton: {
    marginTop: 40,
    padding: 15,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;
