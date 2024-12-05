import React, { useState, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { signOut, updatePassword, updateEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Header from '../components/Header';

// Define the drawer param list type
type DrawerParamList = {
  Profile: undefined;
  Home: undefined;
  ActiveRooms: undefined;
  Room: { roomIndex: number } | undefined;
  Login: undefined;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [profilePhoto, setProfilePhoto] = useState<number | null>(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [lastUsernameChange, setLastUsernameChange] = useState<Date | null>(null);
  const [username, setUsername] = useState('');
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [showHandRankings, setShowHandRankings] = useState(false);
  const userId = auth.currentUser?.uid;

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

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
        try {
          // Fetch user data
          const userDoc = doc(db, 'users', userId);
          const docSnap = await getDoc(userDoc);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfilePhoto(data.profilePhoto ?? null);
            setUsername(data.username || '');
            setLastUsernameChange(data.lastUsernameChange ? new Date(data.lastUsernameChange) : null);
          } else {
            // Create initial user document if it doesn't exist
            await setDoc(doc(db, 'users', userId), {
              profilePhoto: null,
              username: '',
              lastUsernameChange: null,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch user data');
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
    if (!userId) return;

    Alert.alert('Confirm', 'Do you want to use this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await setDoc(
              doc(db, 'users', userId),
              { 
                profilePhoto: photoIndex,
                updatedAt: new Date().toISOString()
              },
              { merge: true }
            );
            setProfilePhoto(photoIndex);
            setShowPhotoPicker(false);
            Alert.alert('Success', 'Profile photo updated successfully!');
          } catch (error) {
            Alert.alert('Error', 'Failed to update profile photo');
          }
        },
      },
    ]);
  };

  const handleChangeUsername = async () => {
    if (!userId) return;
    if (remainingDays !== null) {
      Alert.alert('Wait', `You can change your username in ${remainingDays} days.`);
      return;
    }

    setShowUsernameModal(true);
  };

  const submitUsername = async () => {
    if (!newUsername || !userId) return;

    try {
      // Check if username is already taken
      const usernameDoc = doc(db, 'usernames', newUsername.toLowerCase());
      const usernameSnap = await getDoc(usernameDoc);
      
      if (usernameSnap.exists()) {
        Alert.alert('Error', 'Username already taken.');
        return;
      }

      // Delete old username document if it exists
      if (username) {
        await setDoc(doc(db, 'usernames', username.toLowerCase()), {});
      }

      // Create new username document
      await setDoc(usernameDoc, { userId });

      // Update user document
      const userDocRef = doc(db, 'users', userId);
      await setDoc(
        userDocRef,
        { 
          username: newUsername,
          lastUsernameChange: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      setUsername(newUsername);
      setLastUsernameChange(new Date());
      setShowUsernameModal(false);
      setNewUsername('');
      Alert.alert('Success', 'Username updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update username');
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

  const handleChangeEmail = async () => {
    const newEmail = prompt('Enter a new email:');
    if (!newEmail || !auth.currentUser) return;

    try {
      await updateEmail(auth.currentUser, newEmail);
      
      // Update email in users collection
      if (userId) {
        await setDoc(
          doc(db, 'users', userId),
          { 
            email: newEmail,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      }
      
      Alert.alert('Success', 'Email updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleShareApp = () => {
    Share.share({
      message: 'Check out this amazing poker app!',
    });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => Alert.alert('Signed Out', 'You have been successfully signed out.'))
      .catch((error) => Alert.alert('Error', error.message));
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
      <Header 
        title="Profile"
        onMenuPress={handleMenuPress}
      />
      <View style={styles.contentContainer}>
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

        {/* Sign Out Button */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

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

      {/* Username Change Modal */}
      <Modal visible={showUsernameModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.usernameModalContent}>
            <Text style={styles.modalTitle}>Change Username</Text>
            <TextInput
              style={styles.usernameInput}
              placeholder="Enter new username"
              placeholderTextColor="#666"
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                onPress={() => {
                  setShowUsernameModal(false);
                  setNewUsername('');
                }}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitUsername}
                style={[styles.modalButton, styles.submitButton]}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
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
    textAlign: 'center',
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
  signOutButton: {
    width: '80%',
    padding: 10,
    backgroundColor: '#FF4C4C',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  signOutButtonText: {
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
  usernameModalContent: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  usernameInput: {
    backgroundColor: '#2C2C2C',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 15,
    fontSize: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#FF4C4C',
  },
  submitButton: {
    backgroundColor: '#4ADE80',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen;
