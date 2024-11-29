import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Image,
  Share,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { signOut, updatePassword, updateEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ProfileScreenProps {
  openMenu: () => void; // Pass the `openMenu` function as a prop
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ openMenu }) => {
  const [profilePhoto, setProfilePhoto] = useState<number | null>(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [lastUsernameChange, setLastUsernameChange] = useState<Date | null>(null);
  const [username, setUsername] = useState('');
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [showHandRankings, setShowHandRankings] = useState(false);
  const userId = auth.currentUser?.uid;

  const profilePictures = [
    require('../assets/profile-pictures/pic1.png'),
    require('../assets/profile-pictures/pic2.png'),
    require('../assets/profile-pictures/pic3.png'),
    require('../assets/profile-pictures/pic4.png'),
    require('../assets/profile-pictures/pic5.png'),
    require('../assets/profile-pictures/pic6.png'),
    require('../assets/profile-pictures/pic7.png'),
    require('../assets/profile-pictures/pic8.png'),
    require('../assets/profile-pictures/pic9.png'),
    require('../assets/profile-pictures/pic10.png'),
    require('../assets/profile-pictures/pic11.png'),
    require('../assets/profile-pictures/pic12.png'),
    require('../assets/profile-pictures/pic13.png'),
    require('../assets/profile-pictures/pic14.png'),
    require('../assets/profile-pictures/pic15.png'),
    require('../assets/profile-pictures/pic16.png'),
    require('../assets/profile-pictures/pic17.png'),
    require('../assets/profile-pictures/pic18.png'),
    require('../assets/profile-pictures/pic19.png'),
    require('../assets/profile-pictures/pic20.png'),
    require('../assets/profile-pictures/pic21.png'),
    require('../assets/profile-pictures/pic22.png'),
    require('../assets/profile-pictures/pic23.png'),
    require('../assets/profile-pictures/pic24.png'),
    require('../assets/profile-pictures/pic25.png'),
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userDoc = doc(db, 'users', userId);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfilePhoto(data.profilePhoto ?? null);
          setUsername(data.username || '');
          setLastUsernameChange(data.lastUsernameChange ? new Date(data.lastUsernameChange) : null);
        }
      }
    };
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (lastUsernameChange) {
      const now = new Date();
      const diffInMs = lastUsernameChange.getTime() + 14 * 24 * 60 * 60 * 1000 - now.getTime();
      const daysRemaining = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
      setRemainingDays(daysRemaining > 0 ? daysRemaining : null);
    }
  }, [lastUsernameChange]);

  const handleProfilePhotoChange = async (photoIndex: number) => {
    Alert.alert('Confirm', 'Do you want to use this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setProfilePhoto(photoIndex);
          if (userId) {
            await setDoc(
              doc(db, 'users', userId),
              { profilePhoto: photoIndex },
              { merge: true }
            );
            Alert.alert('Success', 'Profile photo updated successfully!');
          }
          setShowPhotoPicker(false);
        },
      },
    ]);
  };

  const handleChangeUsername = async () => {
    if (remainingDays !== null) {
      Alert.alert('Wait', `You can change your username in ${remainingDays} days.`);
      return;
    }

    const newUsername = prompt('Enter a new username:');
    if (newUsername) {
      const usernameDoc = doc(db, 'usernames', newUsername);
      const usernameSnap = await getDoc(usernameDoc);
      if (usernameSnap.exists()) {
        Alert.alert('Error', 'Username already taken.');
        return;
      }
      if (userId) {
        await setDoc(
          doc(db, 'users', userId),
          { username: newUsername, lastUsernameChange: new Date().toISOString() },
          { merge: true }
        );
        setUsername(newUsername);
        setLastUsernameChange(new Date());
        Alert.alert('Success', 'Username updated successfully!');
      }
    }
  };

  const handleChangePassword = () => {
    const newPassword = prompt('Enter a new password:');
    if (newPassword) {
      updatePassword(auth.currentUser!, newPassword)
        .then(() => Alert.alert('Success', 'Password updated successfully!'))
        .catch((error) => Alert.alert('Error', error.message));
    }
  };

  const handleChangeEmail = () => {
    const newEmail = prompt('Enter a new email:');
    if (newEmail) {
      updateEmail(auth.currentUser!, newEmail)
        .then(() => Alert.alert('Success', 'Email updated successfully!'))
        .catch((error) => Alert.alert('Error', error.message));
    }
  };

  const handleShareApp = () => {
    Share.share({
      message: 'Check out this amazing poker app!',
    });
  };

  const pokerHandRankings = [
    'Royal Flush',
    'Straight Flush',
    'Four of a Kind',
    'Full House',
    'Flush',
    'Straight',
    'Three of a Kind',
    'Two Pair',
    'One Pair',
    'High Card',
  ];

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu} style={styles.hamburgerButton}>
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} /> {/* Placeholder for centering */}
      </View>

      <TouchableOpacity onPress={() => setShowPhotoPicker(true)}>
        <Image
          source={
            profilePhoto !== null
              ? profilePictures[profilePhoto]
              : require('../assets/profile-placeholder.png')
          }
          style={styles.profileImage}
        />
        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
      </TouchableOpacity>

      <Text style={styles.usernameText}>Username: {username}</Text>
      <TouchableOpacity
        onPress={handleChangeUsername}
        style={[styles.button, remainingDays !== null && styles.disabledButton]}
        disabled={remainingDays !== null}
      >
        <Text style={styles.buttonText}>Change Username</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleChangePassword} style={styles.button}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleChangeEmail} style={styles.button}>
        <Text style={styles.buttonText}>Change Email</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleShareApp} style={styles.button}>
        <Text style={styles.buttonText}>Share the App</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowHandRankings(true)} style={styles.button}>
        <Text style={styles.buttonText}>Hand Rankings</Text>
      </TouchableOpacity>

      {/* Profile Picture Picker Modal */}
      <Modal visible={showPhotoPicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <FlatList
            data={profilePictures}
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => handleProfilePhotoChange(index)}>
                <Image source={item} style={styles.modalImage} />
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={() => setShowPhotoPicker(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Hand Rankings Modal */}
      <Modal visible={showHandRankings} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Poker Hand Rankings</Text>
          {pokerHandRankings.map((hand, index) => (
            <Text key={index} style={styles.modalText}>
              {index + 1}. {hand}
            </Text>
          ))}
          <TouchableOpacity
            onPress={() => setShowHandRankings(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  hamburgerButton: {
    paddingHorizontal: 10,
  },
  hamburgerText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24, // Matches the width of the hamburger icon for balance
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#4ADE80',
    textDecorationLine: 'underline',
  },
  usernameText: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 10,
  },
  button: {
    width: '80%',
    padding: 10,
    backgroundColor: '#4ADE80',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 50,
  },
  modalCloseButton: {
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 5,
  },
});

export default ProfileScreen;
