import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Button,
} from 'react-native';

interface Room {
  name: string;
  participants: string[];
}

const ActiveRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newParticipants, setNewParticipants] = useState<string[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState('');

  // Add a new room to the list
  const handleAddRoom = () => {
    if (newRoomName.trim() && newParticipants.length > 0) {
      setRooms((prevRooms) => [
        ...prevRooms,
        { name: newRoomName.trim(), participants: [...newParticipants] },
      ]);
      setModalVisible(false);
      setNewRoomName('');
      setNewParticipants([]);
      setCurrentParticipant('');
    }
  };

  // Add a participant to the new room
  const handleAddParticipant = () => {
    if (currentParticipant.trim()) {
      setNewParticipants((prevParticipants) => [
        ...prevParticipants,
        currentParticipant.trim(),
      ]);
      setCurrentParticipant('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Title and Add Room Button */}
      <View style={styles.header}>
        <Text style={styles.title}>Active Rooms</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.addButton}>Add Room</Text>
        </TouchableOpacity>
      </View>

      {/* List of Rooms */}
      <FlatList
        data={rooms}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.room}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.roomParticipants}>
              {item.participants.length} participants
            </Text>
          </View>
        )}
      />

      {/* Add Room Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a New Room</Text>

            {/* Room Name Input */}
            <TextInput
              style={styles.input}
              placeholder="Room Name"
              placeholderTextColor="#888"
              value={newRoomName}
              onChangeText={setNewRoomName}
            />

            {/* Add Participants */}
            <View style={styles.participantInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Participant Name"
                placeholderTextColor="#888"
                value={currentParticipant}
                onChangeText={setCurrentParticipant}
              />
              <Button title="Add" onPress={handleAddParticipant} />
            </View>

            {/* Display Participants */}
            <FlatList
              data={newParticipants}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.participant}>{item}</Text>
              )}
            />

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Add Room" onPress={handleAddRoom} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    fontSize: 16,
    color: '#4ADE80',
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
  roomParticipants: {
    color: '#888',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    width: '90%',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  participantInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  participant: {
    color: '#fff',
    fontSize: 14,
    marginVertical: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default ActiveRooms;
