import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Header from '../components/Header';
import AddRoomModal from '../components/AddRoomModal';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Participant } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

interface ActiveRoomsPageProps {
  rooms: { name: string; participants: Participant[] }[];
  setRooms: React.Dispatch<React.SetStateAction<{ name: string; participants: Participant[] }[]>>;
  navigateTo: (screen: 'Home' | 'ActiveRooms' | 'Room' | 'Profile' | 'Login', roomIndex?: number) => void;
  openMenu: () => void;
}

const ActiveRoomsPage: React.FC<ActiveRoomsPageProps> = ({
  rooms,
  setRooms,
  navigateTo,
  openMenu,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const userId = auth.currentUser?.uid;
  const [removeModalVisible, setRemoveModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const userDoc = doc(db, 'users', userId);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || '');
          setRooms(data.rooms || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleAddRoom = async (newRoom: {
    name: string;
    participants: Participant[];
  }) => {
    try {
      const updatedRooms = [...rooms, newRoom];
      setRooms(updatedRooms);
      if (userId) {
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, { rooms: updatedRooms });
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const getTotalWinLoss = (participants: Participant[]) => {
    return participants.reduce((total, participant) => total + participant.winLoss, 0);
  };

  const handleRemoveParticipant = async (participantName: string, roomIndex: number) => {
    try {
      const updatedRooms = [...rooms];
      updatedRooms[roomIndex] = {
        ...updatedRooms[roomIndex],
        participants: updatedRooms[roomIndex].participants.filter(
          (p) => p.name !== participantName
        ),
      };

      setRooms(updatedRooms);

      if (userId) {
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, { rooms: updatedRooms });
      }

      Alert.alert('Success', `${participantName} has been removed from the room.`);
    } catch (error) {
      console.error('Error removing participant:', error);
      Alert.alert('Error', 'Failed to remove participant. Please try again.');
    }
  };

  const renderRoomCard = ({ item, index }: { item: { name: string; participants: Participant[] }, index: number }) => (
    <TouchableOpacity 
      style={styles.roomCard}
      onPress={() => navigateTo('Room', index)}
      onLongPress={() => {
        Alert.alert(
          'Room Options',
          'What would you like to do?',
          [
            {
              text: 'Remove Participant',
              onPress: () => {
                Alert.alert(
                  'Select Participant to Remove',
                  'Who would you like to remove?',
                  [
                    ...item.participants.map((participant) => ({
                      text: participant.name,
                      onPress: () => handleRemoveParticipant(participant.name, index),
                    })),
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                  ]
                );
              },
            },
            {
              text: 'Delete Room',
              onPress: async () => {
                try {
                  const updatedRooms = rooms.filter((_, i) => i !== index);
                  setRooms(updatedRooms);
                  if (userId) {
                    const userDoc = doc(db, 'users', userId);
                    await updateDoc(userDoc, { rooms: updatedRooms });
                  }
                  Alert.alert('Success', 'Room has been deleted.');
                } catch (error) {
                  console.error('Error deleting room:', error);
                  Alert.alert('Error', 'Failed to delete room. Please try again.');
                }
              },
              style: 'destructive',
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.roomName}>{item.name}</Text>
        <MaterialIcons name="arrow-forward-ios" size={20} color="#888" />
      </View>
      
      <View style={styles.roomStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Players</Text>
          <Text style={styles.statValue}>{item.participants.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Pool</Text>
          <Text style={[styles.statValue, { color: getTotalWinLoss(item.participants) >= 0 ? '#4ADE80' : '#EF4444' }]}>
            ${Math.abs(getTotalWinLoss(item.participants)).toFixed(2)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last Active</Text>
          <Text style={styles.statValue}>
            {item.participants[0]?.history?.length > 0
              ? new Date(item.participants[0].history[item.participants[0].history.length - 1].date).toLocaleDateString()
              : 'Never'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Active Rooms" onMenuPress={openMenu} />

      {rooms.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="casino" size={64} color="#888" />
          <Text style={styles.emptyStateText}>No active rooms</Text>
          <Text style={styles.emptyStateSubtext}>Create a room to get started</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderRoomCard}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          if (!username) {
            Alert.alert(
              'No Username Set',
              'Please set your username in the Profile screen before creating a room.',
              [
                {
                  text: 'Go to Profile',
                  onPress: () => navigateTo('Profile')
                },
                {
                  text: 'Cancel',
                  style: 'cancel'
                }
              ]
            );
            return;
          }
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Create Room</Text>
      </TouchableOpacity>

      <AddRoomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddRoom={handleAddRoom}
        username={username}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  roomCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4ADE80',
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
  },
});

export default ActiveRoomsPage;
