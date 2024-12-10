import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Text, TouchableOpacity, Modal, Alert, ToastAndroid, TouchableWithoutFeedback } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Header from '../components/Header';
import RoomGraph from '../components/RoomGraph';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Participant {
  name: string;
  winLoss: number;
  history: { date: string; amount: number; in?: number; out?: number }[];
  in?: string;
  out?: string;
  selectedDate?: string;
}

interface RoomPageProps {
  room: { name: string; participants: Participant[] };
  roomIndex: number;
  setRooms: React.Dispatch<React.SetStateAction<{ name: string; participants: Participant[] }[]>>;
  navigateTo: (screen: 'Home' | 'ActiveRooms') => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ room, roomIndex, setRooms, navigateTo }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedParticipants, setUpdatedParticipants] = useState([...room.participants]);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; date: string } | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [isEditDateModalVisible, setEditDateModalVisible] = useState(false);
  const [isEditValuesModalVisible, setEditValuesModalVisible] = useState(false);
  const [selectedEditDate, setSelectedEditDate] = useState<string | null>(null);
  
  type RoomPageNavigationProp = StackNavigationProp<RootStackParamList, 'EditDateScreen'>;
  
  const navigation = useNavigation<RoomPageNavigationProp>();

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const loadInitialData = async () => {
      if (userId) {
        try {
          const userDoc = doc(db, 'users', userId);
          const userSnap = await getDoc(userDoc);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentRoom = userData.rooms[roomIndex];
            
            if (currentRoom) {
              setUpdatedParticipants(currentRoom.participants);
            }
          }
        } catch (error) {
          console.error('Error loading initial data:', error);
          ToastAndroid.show('Error loading data. Please try again.', ToastAndroid.SHORT);
        }
      }
    };

    loadInitialData();
  }, [userId, roomIndex]);

  useEffect(() => {
    if (isUpdating) {
      const currentDate = new Date().toISOString().slice(0, 10);
      setUpdatedParticipants((prev) =>
        prev.map((participant) => ({
          ...participant,
          selectedDate: participant.selectedDate || currentDate,
        }))
      );
    }
  }, [isUpdating]);

  const totalIn = updatedParticipants.reduce((sum, participant) => {
    return sum + (parseFloat(participant.in || '0') || 0);
  }, 0);

  const totalOut = updatedParticipants.reduce((sum, participant) => {
    return sum + (parseFloat(participant.out || '0') || 0);
  }, 0);

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const handleDateConfirm = (date: Date) => {
    setDatePickerVisible(false);
    if (selectedParticipant) {
      const formattedDate = date.toISOString().slice(0, 10);
      setUpdatedParticipants((prev) =>
        prev.map((p) =>
          p.name === selectedParticipant ? { ...p, selectedDate: formattedDate } : p
        )
      );
    }
  };

  const handleConfirmUpdate = async () => {
    try {
      // Create new participants array with updated values
      const newParticipants = updatedParticipants.map((participant) => {
        const amountIn = parseFloat(participant.in || '0');
        const amountOut = parseFloat(participant.out || '0');
        const currentDate = participant.selectedDate || new Date().toISOString().slice(0, 10);

        const updatedHistory = [
          ...(participant.history || []),
          {
            date: currentDate,
            amount: amountOut - amountIn,
            in: amountIn || 0,
            out: amountOut || 0
          },
        ];

        // Calculate new win/loss total
        const newWinLoss = updatedHistory.reduce((acc, entry) => acc + entry.amount, 0);

        // Return clean participant object
        return {
          name: participant.name,
          winLoss: newWinLoss,
          history: updatedHistory
        };
      });

      // Save to Firestore
      if (userId) {
        const userDoc = doc(db, 'users', userId);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
          // Get current rooms array
          const currentData = userSnap.data();
          const updatedRooms = [...currentData.rooms];
          
          // Update the specific room
          updatedRooms[roomIndex] = {
            ...updatedRooms[roomIndex],
            name: room.name,
            participants: newParticipants
          };

          // Update Firestore
          await updateDoc(userDoc, {
            rooms: updatedRooms
          });

          // Update local state
          setRooms(updatedRooms);
          
          // Update the local participants state
          setUpdatedParticipants(newParticipants.map(p => ({
            ...p,
            in: undefined,
            out: undefined,
            selectedDate: undefined
          })));

          setIsUpdating(false);
          ToastAndroid.show('Updates confirmed successfully!', ToastAndroid.SHORT);
        }
      }
    } catch (error) {
      console.error('Error updating document:', error);
      ToastAndroid.show('Error updating data. Please try again.', ToastAndroid.SHORT);
    }
  };

  const addParticipant = () => {
    if (newParticipantName.trim() === '') {
      Alert.alert('Invalid Name', 'Please enter a valid participant name.');
      return;
    }
    if (updatedParticipants.some((p) => p.name.toLowerCase() === newParticipantName.trim().toLowerCase())) {
      Alert.alert('Duplicate Name', 'A participant with this name already exists.');
      return;
    }
  
    const newParticipant = {
      name: newParticipantName.trim(),
      winLoss: 0,
      history: [],
    };
  
    setUpdatedParticipants((prev) => [...prev, newParticipant]);
    setModalVisible(false);
    setNewParticipantName('');
    ToastAndroid.show('Participant added successfully!', ToastAndroid.SHORT);
  };  

  const handleRemoveParticipant = (name: string) => {
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setUpdatedParticipants((prev) => prev.filter((p) => p.name !== name));
            setRemoveModalVisible(false);
            ToastAndroid.show(`${name} removed successfully!`, ToastAndroid.SHORT);
          },
        },
      ]
    );
  };

  const handleDeleteDateEntry = async () => {
    if (!selectedEditDate) return;

    const newParticipants = updatedParticipants.map((participant) => {
      const updatedHistory = participant.history.filter((entry) => entry.date !== selectedEditDate);
      const newWinLoss = updatedHistory.reduce((acc, entry) => acc + entry.amount, 0);

      return {
        ...participant,
        winLoss: newWinLoss,
        history: updatedHistory,
      };
    });

    setUpdatedParticipants(newParticipants);
    setEditValuesModalVisible(false);
    setSelectedEditDate(null);
    ToastAndroid.show('Date entry deleted successfully!', ToastAndroid.SHORT);

    // Save to Firestore
    if (userId) {
      const userDoc = doc(db, 'users', userId);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        // Get current rooms array
        const currentData = userSnap.data();
        const updatedRooms = [...currentData.rooms];
        
        // Update the specific room
        updatedRooms[roomIndex] = {
          ...updatedRooms[roomIndex],
          name: room.name,
          participants: newParticipants
        };

        // Update Firestore
        await updateDoc(userDoc, {
          rooms: updatedRooms
        });

        // Update local state
        setRooms(updatedRooms);
      }
    }
  };

  // Function to handle editing values for a selected date
  const handleEditValues = (date: string) => {
    setSelectedEditDate(date);
    setEditDateModalVisible(false);
    setTimeout(() => {
      setEditValuesModalVisible(true);
    }, 500); // Adding a delay to ensure smooth transition
  };

  const handleEditDate = () => {
    navigation.navigate('EditDateScreen', { participants: updatedParticipants });
  };

  return (
    <View style={styles.container}>
      <Header title={room.name} onBack={() => navigateTo('ActiveRooms')} onUpdate={() => setIsUpdating(!isUpdating)} />
      <RoomGraph participants={updatedParticipants} />
      <FlatList
        data={updatedParticipants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) =>
          isUpdating ? (
            <View style={styles.participantRow}>
              <View style={[styles.colorDot, { backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)` }]} />
              <Text style={styles.participantName}>{item.name}</Text>
              <TextInput
                style={styles.input}
                placeholder="In"
                placeholderTextColor="#888"
                value={item.in || ''}
                onChangeText={(text) =>
                  setUpdatedParticipants((prev) =>
                    prev.map((p) => (p.name === item.name ? { ...p, in: text } : p))
                  )
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Out"
                placeholderTextColor="#888"
                value={item.out || ''}
                onChangeText={(text) =>
                  setUpdatedParticipants((prev) =>
                    prev.map((p) => (p.name === item.name ? { ...p, out: text } : p))
                  )
                }
              />
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setSelectedParticipant(item.name);
                  setDatePickerVisible(true);
                }}
              >
                <Text style={styles.dateButtonText}>{item.selectedDate || 'Date'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.participantRow}>
              <View style={[styles.colorDot, { backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)` }]} />
              <Text style={styles.participantName}>{item.name}</Text>
              <Text style={styles.participantDate}>
                {item.history && item.history.length > 0 ? formatDate(item.history[item.history.length - 1].date) : 'No Data'}
              </Text>
              <Text style={styles.winLoss}>${item.winLoss.toFixed(2)}</Text>
            </View>
          )
        }
      />
      {isUpdating && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>Add Participant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={() => setRemoveModalVisible(true)}>
            <Text style={styles.removeButtonText}>Remove Participant</Text>
          </TouchableOpacity>
        </View>
      )}
      {isUpdating && (
        <TouchableOpacity
          style={[styles.confirmButton, totalIn !== totalOut && styles.disabledButton]}
          onPress={handleConfirmUpdate}
          disabled={totalIn !== totalOut}
        >
          <Text style={styles.confirmButtonText}>Confirm ({totalIn !== totalOut ? 'Mismatch' : 'Ready'})</Text>
        </TouchableOpacity>
      )}
      {isUpdating && (
        <TouchableOpacity
          style={styles.updateValuesButton}
          onPress={handleEditDate}
        >
          <Text style={styles.updateValuesButtonText}>Edit Date</Text>
        </TouchableOpacity>
      )}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
      />

      {/* Add Participant Modal */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter name"
                  value={newParticipantName}
                  onChangeText={setNewParticipantName}
                />
                <TouchableOpacity style={styles.modalButton} onPress={addParticipant}>
                  <Text style={styles.modalButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
  
      {/* Remove Participant Modal */}
        <Modal
          transparent
          visible={removeModalVisible}
          animationType="slide"
          onRequestClose={() => setRemoveModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setRemoveModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <FlatList
                    data={updatedParticipants}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.removeItem}
                        onPress={() => handleRemoveParticipant(item.name)}
                      >
                        <Text style={styles.modalItemText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setRemoveModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Date Selection Modal */}
        <Modal
          transparent
          visible={isEditDateModalVisible}
          animationType="slide"
          onRequestClose={() => setEditDateModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setEditDateModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select a Date</Text>
                  <FlatList
                    data={[
                      ...new Set(
                        updatedParticipants.flatMap((p) =>
                          p.history ? p.history.map((h) => h.date) : []
                        )
                      ),
                    ]} // Extract unique dates
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => handleEditValues(item)}
                      >
                        <Text style={styles.dateButtonText}>{formatDate(item)}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setEditDateModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Edit Values Modal */}
        <Modal
          transparent
          visible={isEditValuesModalVisible}
          animationType="slide"
          onRequestClose={() => setEditValuesModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setEditValuesModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Values for {formatDate(selectedEditDate || '')}</Text>
                  {updatedParticipants.map((participant, index) => {
                    const historyEntry = participant.history?.find((h) => h.date === selectedEditDate);
                    if (!historyEntry) return null; // Skip participants without matching history

                    return (
                      <View key={index} style={styles.participantRow}>
                        <Text style={styles.participantName}>{participant.name}</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="In"
                          placeholderTextColor="#888"
                          value={historyEntry.in?.toString() || ''}
                          onChangeText={(text) => {
                            const newIn = parseFloat(text) || 0;
                            setUpdatedParticipants((prev) =>
                              prev.map((p) =>
                                p.name === participant.name
                                  ? {
                                      ...p,
                                      history: p.history.map((h) =>
                                        h.date === selectedEditDate ? { ...h, in: newIn } : h
                                      ),
                                    }
                                  : p
                              )
                            );
                          }}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Out"
                          placeholderTextColor="#888"
                          value={historyEntry.out?.toString() || ''}
                          onChangeText={(text) => {
                            const newOut = parseFloat(text) || 0;
                            setUpdatedParticipants((prev) =>
                              prev.map((p) =>
                                p.name === participant.name
                                  ? {
                                      ...p,
                                      history: p.history.map((h) =>
                                        h.date === selectedEditDate ? { ...h, out: newOut } : h
                                      ),
                                    }
                                  : p
                              )
                            );
                          }}
                        />
                      </View>
                    );
                  })}
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setEditValuesModalVisible(false);
                      handleConfirmUpdate();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setEditValuesModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteDateEntry}
                  >
                    <Text style={styles.deleteButtonText}>Delete Date Entry</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  participantName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  participantDate: {
    color: '#888',
    fontSize: 14,
    marginRight: 10,
  },
  winLoss: {
    color: '#4ADE80',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
    width: 60,
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#888',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  updateValuesButton: {
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  updateValuesButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#888',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  modalCancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  removeItem: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RoomPage;