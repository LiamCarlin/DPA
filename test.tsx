import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ToastAndroid,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import * as d3Shape from 'd3-shape';
import { scaleLinear, scalePoint } from 'd3-scale';
import Svg, { Line, Path, G, Circle, Text as SvgText, Rect } from 'react-native-svg';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { db } from '../firebaseConfig'; // Firebase configuration file
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Header from '../components/Header';

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
  setRooms: React.Dispatch<
    React.SetStateAction<
      { name: string; participants: Participant[] }[]
    >
  >;
  navigateTo: (screen: 'Home' | 'ActiveRooms') => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ room, roomIndex, setRooms, navigateTo }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedParticipants, setUpdatedParticipants] = useState<Participant[]>([]);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    date: string;
  } | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [isEditDateModalVisible, setEditDateModalVisible] = useState(false);
  const [isEditValuesModalVisible, setEditValuesModalVisible] = useState(false);
  const [selectedEditDate, setSelectedEditDate] = useState<string | null>(null);

  const { width } = Dimensions.get('window');
  const graphWidth = width - 40;
  const graphHeight = 250;

  const roomDocRef = doc(db, 'rooms', `room_${roomIndex}`); // Firestore document reference

  // Fetch room data from Firestore on component mount
  useEffect(() => {
    const fetchRoomData = async () => {
      const docSnap = await getDoc(roomDocRef);
      if (docSnap.exists()) {
        const roomData = docSnap.data();
        setUpdatedParticipants(roomData.participants || []);
      } else {
        setUpdatedParticipants(room.participants); // Use default participants if no data exists in Firestore
      }
    };
    fetchRoomData();
  }, [roomIndex]);

  // Save updated participants to Firestore
  const saveToFirestore = async (participants: Participant[]) => {
    try {
      await setDoc(roomDocRef, { name: room.name, participants });
      ToastAndroid.show('Data saved to Firebase!', ToastAndroid.SHORT);
    } catch (error) {
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
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

  const handleConfirmUpdate = () => {
    const newParticipants = updatedParticipants.map((participant) => {
      const amountIn = parseFloat(participant.in || '0');
      const amountOut = parseFloat(participant.out || '0');

      const updatedHistory = [
        ...(participant.history || []),
        {
          date: participant.selectedDate!,
          amount: amountOut - amountIn,
          in: amountIn,
          out: amountOut,
        },
      ];

      return {
        ...participant,
        winLoss: updatedHistory.reduce((acc, entry) => acc + entry.amount, 0),
        history: updatedHistory,
        in: undefined,
        out: undefined,
        selectedDate: undefined,
      };
    });

    setUpdatedParticipants(newParticipants);
    setIsUpdating(false);
    saveToFirestore(newParticipants);
  };

  const addParticipant = () => {
    if (newParticipantName.trim() === '') {
      Alert.alert('Invalid Name', 'Please enter a valid participant name.');
      return;
    }
    if (
      updatedParticipants.some(
        (p) => p.name.toLowerCase() === newParticipantName.trim().toLowerCase()
      )
    ) {
      Alert.alert('Duplicate Name', 'A participant with this name already exists.');
      return;
    }

    const newParticipant: Participant = {
      name: newParticipantName.trim(),
      winLoss: 0,
      history: [],
    };

    const newParticipants = [...updatedParticipants, newParticipant];
    setUpdatedParticipants(newParticipants);
    setModalVisible(false);
    setNewParticipantName('');
    saveToFirestore(newParticipants);
  };

  const handleRemoveParticipant = (name: string) => {
    Alert.alert('Confirm Removal', `Are you sure you want to remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newParticipants = updatedParticipants.filter((p) => p.name !== name);
          setUpdatedParticipants(newParticipants);
          saveToFirestore(newParticipants);
          ToastAndroid.show(`${name} removed successfully!`, ToastAndroid.SHORT);
        },
      },
    ]);
  };

  const renderGraph = () => {
    // Graph rendering logic remains the same
  };

  return (
    <View style={styles.container}>
      <Header
        title={room.name}
        onBack={() => navigateTo('ActiveRooms')}
        onUpdate={() => setIsUpdating(!isUpdating)}
      />
      {renderGraph()}
      <FlatList
        data={updatedParticipants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) =>
          isUpdating ? (
            <View style={styles.participantRow}>
              {/* Update UI */}
            </View>
          ) : (
            <View style={styles.participantRow}>
              {/* Display participant data */}
            </View>
          )
        }
      />
      {/* Add and Remove Participant Modals */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  // Styles remain the same
});

export default RoomPage;
