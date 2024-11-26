import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Preferences {
  theme: string;
  notifications: boolean;
}

const ProfileScreen: React.FC = () => {
  const [preferences, setPreferences] = useState<Preferences>({ theme: 'dark', notifications: true });
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchPreferences = async () => {
      if (userId) {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.theme && typeof data.notifications === 'boolean') {
            setPreferences({
              theme: data.theme,
              notifications: data.notifications,
            });
          } else {
            console.error('Data does not match expected structure:', data);
          }
        } else {
          console.log('No preferences found for user.');
        }
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleSavePreferences = async () => {
    if (userId) {
      try {
        await setDoc(doc(db, 'users', userId), preferences);
        Alert.alert('Success', 'Preferences saved successfully!');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Preferred Theme"
        placeholderTextColor="#888"
        value={preferences.theme}
        onChangeText={(text) => setPreferences({ ...preferences, theme: text })}
      />
      <TouchableOpacity style={styles.button} onPress={handleSavePreferences}>
        <Text style={styles.buttonText}>Save Preferences</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={async () => {
          await signOut(auth);
          Alert.alert('Signed Out', 'You have been signed out.');
        }}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  signOutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#d9534f',
    borderRadius: 5,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;
