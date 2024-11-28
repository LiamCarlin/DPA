import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import AddRoomModal from '../components/AddRoomModal';

interface ActiveRoomsPageProps {
  rooms: { name: string; participants: { name: string; winLoss: number }[] }[];
  setRooms: React.Dispatch<
    React.SetStateAction<
      { name: string; participants: { name: string; winLoss: number }[] }[]
    >
  >;
  navigateTo: (screen: 'Home' | 'ActiveRooms' | 'Room', roomIndex?: number) => void;
  openMenu: () => void;
}

const ActiveRoomsPage: React.FC<ActiveRoomsPageProps> = ({
  rooms,
  setRooms,
  navigateTo,
  openMenu,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddRoom = (newRoom: {
    name: string;
    participants: { name: string; winLoss: number }[];
  }) => {
    setRooms((prevRooms) => [...prevRooms, newRoom]);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Active Rooms"
        onMenuPress={openMenu}
      />

      <TouchableOpacity style={[styles.addButton, { alignSelf: 'center', marginVertical: 10 }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Room</Text>
      </TouchableOpacity>

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
      />

      <AddRoomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddRoom={handleAddRoom}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
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
  addButton: {
    marginTop: 20,
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ActiveRoomsPage;
