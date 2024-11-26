import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Text, TouchableOpacity, Modal, Alert, ToastAndroid, Dimensions, TouchableWithoutFeedback } from 'react-native';
import * as d3Shape from 'd3-shape';
import { scaleLinear, scalePoint } from 'd3-scale';
import Svg, { Line, Path, G, Circle, Text as SvgText, Rect } from 'react-native-svg';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Header from '../components/Header';

interface Participant {
  name: string;
  winLoss: number;
  history: { date: string; amount: number; in?: number; out?: number }[]; // Add `in` and `out` here
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

  const { width } = Dimensions.get('window');
  const graphWidth = width - 40;
  const graphHeight = 250;

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

  const handleConfirmUpdate = () => {
    const newParticipants = updatedParticipants.map((participant) => {
      const amountIn = parseFloat(participant.in || '0');
      const amountOut = parseFloat(participant.out || '0');
  
      const updatedHistory = [
        ...(participant.history || []),
        {
          date: participant.selectedDate!,
          amount: amountOut - amountIn,
          in: amountIn, // Add `in`
          out: amountOut, // Add `out`
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
    ToastAndroid.show('Updates confirmed successfully!', ToastAndroid.SHORT);
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
  

  const renderGraph = () => {
    if (!updatedParticipants || updatedParticipants.length === 0) {
      return (
        <View style={styles.graphContainer}>
          <Text style={styles.noDataText}>No data available to display the graph.</Text>
        </View>
      );
    }

    const data = updatedParticipants.map((participant) =>
      (participant.history || []).map((entry) => ({ date: entry.date, amount: entry.amount }))
    );

    const flatData = data.flat();
    const uniqueDates = [...new Set(flatData.map((d) => d.date))].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const minAmount = Math.min(...flatData.map((d) => d.amount), 0);
    const maxAmount = Math.max(...flatData.map((d) => d.amount), 1);

    if (flatData.length === 0) {
      return (
        <View style={styles.graphContainer}>
          <Text style={styles.noDataText}>No data available to display the graph.</Text>
        </View>
      );
    }

    const xScale = scalePoint()
      .domain(uniqueDates)
      .range([40, graphWidth - 40]);

    const yScale = scaleLinear()
      .domain([minAmount - 10, maxAmount + 10])
      .range([graphHeight - 40, 40]);

    const linePaths = updatedParticipants.map((participant, index) => {
      const lineGenerator = d3Shape
        .line<{ date: string; amount: number }>()
        .x((d) => xScale(d.date)!)
        .y((d) => yScale(d.amount))
        .curve(d3Shape.curveBasis);

      return {
        path: lineGenerator(participant.history || []) || '',
        color: `hsl(${(index * 60) % 360}, 70%, 60%)`,
        data: participant.history || [],
      };
    });

    return (
      <View style={styles.graphContainer}>
        <Svg width={graphWidth} height={graphHeight}>
          <Rect x={0} y={0} width={graphWidth} height={graphHeight} stroke="white" strokeWidth={2} fill="none" />
          {uniqueDates.map((date, i) => (
            <Line
              key={`grid-line-${i}`}
              x1={xScale(date)!}
              x2={xScale(date)!}
              y1={graphHeight - 40}
              y2={40}
              stroke="lightgray"
              strokeWidth={0.5}
            />
          ))}
          {yScale.ticks(5).map((tick, i) => (
            <Line
              key={`horizontal-grid-line-${i}`}
              x1={40}
              x2={graphWidth - 40}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="lightgray"
              strokeWidth={0.5}
            />
          ))}
          {linePaths.map((line, i) => (
            <Path key={`line-${i}`} d={line.path} stroke={line.color} strokeWidth={2} fill="none" />
          ))}
          {linePaths.map((line, i) =>
            line.data.map((point, j) => (
              <Circle
                key={`point-${i}-${j}`}
                cx={xScale(point.date)}
                cy={yScale(point.amount)}
                r={6}
                fill={line.color}
                onPress={() =>
                  setTooltip({
                    x: xScale(point.date)!,
                    y: yScale(point.amount),
                    value: point.amount,
                    date: formatDate(point.date),
                  })
                }
              />
            ))
          )}
          {tooltip && (
            <G>
              <Rect
                x={tooltip.x - 50}
                y={tooltip.y - 30}
                width={100}
                height={30}
                fill="black"
                rx={5}
                ry={5}
              />
              <SvgText
                x={tooltip.x}
                y={tooltip.y - 15}
                fontSize="12"
                fill="white"
                textAnchor="middle"
              >
                {`${tooltip.date}: $${tooltip.value.toFixed(2)}`}
              </SvgText>
            </G>
          )}
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={room.name} onBack={() => navigateTo('ActiveRooms')} onUpdate={() => setIsUpdating(!isUpdating)} />
      {renderGraph()}
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
          onPress={() => setEditDateModalVisible(true)}
        >
          <Text style={styles.updateValuesButtonText}>Edit Values</Text>
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
                      style={styles.removeButton}
                      onPress={() => handleRemoveParticipant(item.name)}
                    >
                      <Text style={styles.removeButtonText}>{item.name}</Text>
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
                      onPress={() => {
                        console.log('Date selected:', item); // Debugging log
                        setSelectedEditDate(item); // Set the selected date
                        setEditDateModalVisible(false); // Close Date Selection Modal
                        setEditValuesModalVisible(true); // Open Edit Values Modal
                      }}
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
                  onPress={() => setEditValuesModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setEditValuesModalVisible(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
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
  graphContainer: {
    marginTop: 20,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#1e1e1e',
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
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addButton: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#5cb85c',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  removeButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#d9534f',
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#2e2e2e',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#444',
    color: '#fff',
    width: '100%',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#5cb85c',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  removeItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#444',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  updateValuesButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
    alignItems: 'center',
  },
  updateValuesButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  participantEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
});


export default RoomPage;
