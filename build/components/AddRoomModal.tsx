import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Participant } from '../types';

interface AddRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onAddRoom: (room: { name: string; participants: Participant[] }) => void;
  username: string;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ visible, onClose, onAddRoom, username }) => {
  const [roomName, setRoomName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState('');

  useEffect(() => {
    if (visible && username && participants.length === 0) {
      setParticipants([{
        name: username,
        winLoss: 0,
        history: []
      }]);
    }
  }, [visible, username]);

  const handleAddParticipant = () => {
    if (currentParticipant.trim()) {
      setParticipants((prev) => [...prev, { 
        name: currentParticipant.trim(), 
        winLoss: 0,
        history: []
      }]);
      setCurrentParticipant('');
    }
  };

  const handleAddRoom = () => {
    if (roomName.trim() && participants.length > 0) {
      onAddRoom({ name: roomName.trim(), participants });
      setRoomName('');
      setParticipants([]);
      setCurrentParticipant('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add a New Room</Text>

          {/* Room Name Input */}
          <TextInput
            style={styles.input}
            placeholder="Room Name"
            placeholderTextColor="#888"
            value={roomName}
            onChangeText={setRoomName}
          />

          {/* Participant Input */}
          <View style={styles.participantInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Participant Name"
              placeholderTextColor="#888"
              value={currentParticipant}
              onChangeText={setCurrentParticipant}
            />
            <TouchableOpacity onPress={handleAddParticipant}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Display Participants */}
          <FlatList
            data={participants}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.participant}>{item.name}</Text>
            )}
          />

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddRoom}>
              <Text style={styles.addButtonText}>Add Room</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddRoomModal;
