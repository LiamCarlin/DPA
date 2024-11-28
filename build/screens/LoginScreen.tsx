import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LoginScreenProps {
  navigateTo: (screen: 'Home' | 'ActiveRooms' | 'Room' | 'Login') => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigateTo }) => {
  const [emailOrUsername, setEmailOrUsername] = useState(''); // For login
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For signup
  const [email, setEmail] = useState(''); // For signup
  const [isSignUp, setIsSignUp] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldown) {
      timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCooldown(false);
            setCooldownTime(60);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCooldown]);

  // Login Logic: Username or Email
  const handleLogin = async () => {
    try {
      let loginEmail = emailOrUsername.trim();

      // Check if input is a username
      if (!emailOrUsername.includes('@')) {
        const usernameDoc = await getDoc(doc(db, 'usernames', emailOrUsername));
        if (!usernameDoc.exists()) {
          Alert.alert('Error', 'Invalid username or email.');
          return;
        }
        loginEmail = usernameDoc.data().userId; // Resolve to email from Firestore
      }

      // Proceed with login using email
      await signInWithEmailAndPassword(auth, loginEmail, password);
      navigateTo('Home');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'Incorrect email, username, or password.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  // Sign-Up Logic with Unique Username Check
  const handleSignUp = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a valid username.');
      return;
    }

    try {
      // Check if username is already taken
      const usernameDoc = await getDoc(doc(db, 'usernames', username));
      if (usernameDoc.exists()) {
        Alert.alert('Error', 'Username is already taken. Please choose another.');
        return;
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Save username in Firestore
      await setDoc(doc(db, 'usernames', username), { userId });
      await setDoc(doc(db, 'users', userId), {
        username,
        email,
        profilePhoto: '',
        friends: [],
        lastUsernameChange: new Date().toISOString(),
      });

      navigateTo('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Forgot Password Logic with Cooldown
  const handleForgotPassword = async () => {
    if (!emailOrUsername.trim()) {
      Alert.alert('Error', 'Please enter your email to reset your password.');
      return;
    }

    if (isCooldown) {
      Alert.alert(
        'Cooldown Active',
        `You can request another password reset email in ${cooldownTime} seconds.`
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailOrUsername);
      Alert.alert(
        'Password Reset',
        'A password reset link has been sent to your email. Please check your inbox.'
      );
      setIsCooldown(true); // Start cooldown
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const isLoginDisabled = !emailOrUsername.trim() || !password.trim();
  const isSignUpDisabled = !email.trim() || !password.trim() || !username.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
      {isSignUp ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </>
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          placeholderTextColor="#888"
          value={emailOrUsername}
          onChangeText={setEmailOrUsername}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[
          styles.button,
          isSignUp ? isSignUpDisabled && styles.disabledButton : isLoginDisabled && styles.disabledButton,
        ]}
        onPress={isSignUp ? handleSignUp : handleLogin}
        disabled={isSignUp ? isSignUpDisabled : isLoginDisabled}
      >
        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
      </TouchableOpacity>

      {/* Forgot Password Button */}
      {!isSignUp && (
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>
            {isCooldown ? `Forgot Password? (Cooldown: ${cooldownTime}s)` : 'Forgot Password?'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp ? 'Already have an account? Login' : 'New here? Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    width: '80%',
    padding: 10,
    backgroundColor: '#4ADE80',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  forgotPasswordText: {
    color: '#4ADE80',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  toggleText: {
    color: '#888',
    marginTop: 10,
  },
});

export default LoginScreen;
