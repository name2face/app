import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, enterLoggedOutMode } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTryOffline = async (screen: keyof RootStackParamList) => {
    try {
      await enterLoggedOutMode();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      // Give a moment for navigation to complete, then navigate to the specific screen
      setTimeout(() => {
        navigation.navigate(screen as any);
      }, 100);
    } catch (error: any) {
      console.error('❌ Error entering offline mode:', error);
      Alert.alert('Error', 'Failed to enter offline mode');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Name2Face - Awesome Beta</Text>
          <Text style={styles.subtitle}>
            Remember names and faces with ease
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {!isSignUp && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.previewTitle}>Try the App First</Text>
          <Text style={styles.previewSubtitle}>Explore features in offline mode</Text>

          <View style={styles.previewGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleTryOffline('AddPerson')}
            >
              <Text style={styles.actionButtonIcon}>➕</Text>
              <Text style={styles.actionButtonText}>Add</Text>
              <Text style={styles.actionButtonHint}>New Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleTryOffline('SearchQuery')}
            >
              <Text style={styles.actionButtonIcon}>🔍</Text>
              <Text style={styles.actionButtonText}>Search</Text>
              <Text style={styles.actionButtonHint}>Find Contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleTryOffline('ContactsList')}
            >
              <Text style={styles.actionButtonIcon}>📋</Text>
              <Text style={styles.actionButtonText}>List</Text>
              <Text style={styles.actionButtonHint}>All Contacts</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.note}>
            Note: This is a V1 implementation. Google and Apple Sign-in will be added in future updates.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    padding: 10,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  previewSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#999',
    marginBottom: 20,
  },
  previewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionButtonHint: {
    fontSize: 11,
    color: '#999',
  },
  note: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
    maxWidth: 400,
    alignSelf: 'center',
  },
  forgotPasswordText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 15,
  },
});

export default LoginScreen;
