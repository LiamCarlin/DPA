import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import UserProgressGraph from '../components/UserProgressGraph';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface HomeScreenProps {
  rooms: { name: string; participants: { name: string; winLoss: number; history: { date: string; amount: number }[] }[] }[];
  navigateTo: (screen: 'Home' | 'ActiveRooms' | 'Room' | 'Profile', roomIndex?: number) => void;
  openMenu: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ rooms, navigateTo, openMenu }) => {
  const [profilePhotoIndex, setProfilePhotoIndex] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState<{ date: string; amount: number }[]>([]);
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
          setProfilePhotoIndex(data.profilePhoto ?? null);
          setUsername(data.username || '');
        }
      }
    };
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (username && rooms.length > 0) {
      // Collect all history entries for the current user across all rooms
      const allHistory: { date: string; amount: number }[] = [];
      rooms.forEach(room => {
        const userInRoom = room.participants.find(p => p.name === username);
        if (userInRoom && userInRoom.history) {
          allHistory.push(...userInRoom.history);
        }
      });
      
      // Sort by date
      allHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setUserData(allHistory);
    }
  }, [rooms, username]);

  const resolvedProfilePhoto =
    profilePhotoIndex !== null && profilePhotoIndex >= 0 && profilePhotoIndex < profilePictures.length
      ? profilePictures[profilePhotoIndex]
      : require('../assets/profile-placeholder.png');

  return (
    <View style={styles.container}>
      <Header
        title="DPA"
        onMenuPress={openMenu}
        profileImageUrl={resolvedProfilePhoto}
        onProfilePress={() => navigateTo('Profile')}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => alert('Chip Counter Feature')}>
          <Text style={styles.buttonText}>📸 Chip Counter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => alert('Calculate Odds Feature')}>
          <Text style={styles.buttonText}>➕ Calculate Odds</Text>
        </TouchableOpacity>
      </View>

      {username ? (
        <UserProgressGraph data={userData} username={username} />
      ) : (
        <View style={styles.graphContainer}>
          <Text style={styles.noUsernameText}>Set your username in Profile to see your progress</Text>
        </View>
      )}

      <View style={styles.activeRoomsContainer}>
        <View style={styles.activeRoomsHeader}>
          <Text style={styles.sectionTitle}>Active Rooms</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigateTo('ActiveRooms')}>
            <Text style={styles.addButtonText}>+ Add Room</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={rooms}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => navigateTo('Room', index)}>
              <View style={styles.room}>
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.roomPlayers}>{item.participants.length} participants</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No Active Rooms</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  graphContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  graphPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
  },
  graphPlaceholderText: {
    color: '#888',
  },
  activeRoomsContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  activeRoomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4ADE80',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  room: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
  },
  roomPlayers: {
    color: '#888',
    fontSize: 14,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  noUsernameText: {
    color: '#888',
    textAlign: 'center',
    padding: 20,
  },
});

export default HomeScreen;
