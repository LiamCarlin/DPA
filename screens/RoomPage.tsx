import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Text, TouchableOpacity } from 'react-native';
import * as d3Shape from 'd3-shape';
import { scaleLinear, scalePoint } from 'd3-scale';
import Svg, { Line, Path, G, Text as SvgText } from 'react-native-svg';
import Header from '../components/Header';

interface Participant {
  name: string;
  winLoss: number;
  history: { date: string; amount: number }[];
  in?: string; // Temporary "In" value during updates
  out?: string; // Temporary "Out" value during updates
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

  // Calculate sums for "In" and "Out"
  const totalIn = updatedParticipants.reduce((sum, participant) => {
    return sum + (parseFloat(participant.in || '0') || 0);
  }, 0);

  const totalOut = updatedParticipants.reduce((sum, participant) => {
    return sum + (parseFloat(participant.out || '0') || 0);
  }, 0);

  // Function to handle confirmation of updates
  const handleConfirmUpdate = () => {
    const newParticipants = updatedParticipants.map((participant) => {
      const amountIn = parseFloat(participant.in || '0');
      const amountOut = parseFloat(participant.out || '0');

      // Update the history with the new values
      const updatedHistory = [
        ...(participant.history || []),
        {
          date: new Date().toISOString().slice(0, 10),
          amount: amountOut - amountIn,
        },
      ];

      return {
        ...participant,
        winLoss: updatedHistory.reduce((acc, entry) => acc + entry.amount, 0), // Recalculate win/loss
        history: updatedHistory,
        in: undefined, // Clear temporary values
        out: undefined,
      };
    });

    // Update the room participants and immediately refresh the state
    setUpdatedParticipants(newParticipants);
    setRooms((prevRooms) => {
      const updatedRooms = [...prevRooms];
      updatedRooms[roomIndex].participants = newParticipants;
      return updatedRooms;
    });

    setIsUpdating(false); // Exit updating mode
  };

  const renderGraph = () => {
    const width = 300;
    const height = 200;
    const padding = 20;

    if (!updatedParticipants || updatedParticipants.length === 0) {
      return (
        <View style={styles.graphContainer}>
          <Text style={styles.noDataText}>No data available to display the graph.</Text>
        </View>
      );
    }

    const data = updatedParticipants.map((participant) =>
      (participant.history || []).map((entry) => entry.amount)
    );

    const xLabels = updatedParticipants[0]?.history?.map((entry) => entry.date) || [];
    const flatData = data.flat();

    if (flatData.length === 0) {
      return (
        <View style={styles.graphContainer}>
          <Text style={styles.noDataText}>No data available to display the graph.</Text>
        </View>
      );
    }

    const xScale = scalePoint()
      .domain(xLabels)
      .range([padding, width - padding]);

    const yScale = scaleLinear()
      .domain([Math.min(...flatData, 0), Math.max(...flatData, 1)])
      .range([height - padding, padding]);

    const linePaths = updatedParticipants.map((participant) => {
      const lineGenerator = d3Shape
        .line<{ date: string; amount: number }>()
        .x((d) => xScale(d.date)!)
        .y((d) => yScale(d.amount))
        .curve(d3Shape.curveNatural);

      return lineGenerator(participant.history || []) || '';
    });

    return (
      <View style={styles.graphContainer}>
        <Svg width={width} height={height}>
          {/* Grid */}
          {yScale.ticks(5).map((tick, i) => (
            <Line
              key={`grid-line-${i}`}
              x1={padding}
              x2={width - padding}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="lightgray"
              strokeDasharray="4,2"
            />
          ))}

          {/* Line Paths */}
          {linePaths.map((path, i) => (
            <Path key={`line-${i}`} d={path} stroke={`rgb(${50 + i * 50}, 100, 200)`} strokeWidth={2} fill="none" />
          ))}

          {/* X Axis Labels */}
          <G>
            {xLabels.map((label, i) => (
              <SvgText
                key={`x-label-${i}`}
                x={xScale(label)}
                y={height - padding / 2}
                fontSize="10"
                fill="white"
                textAnchor="middle"
              >
                {label}
              </SvgText>
            ))}
          </G>

          {/* Y Axis Labels */}
          <G>
            {yScale.ticks(5).map((tick, i) => (
              <SvgText
                key={`y-label-${i}`}
                x={padding / 2}
                y={yScale(tick)}
                fontSize="10"
                fill="white"
                textAnchor="middle"
              >
                {tick.toFixed(0)}
              </SvgText>
            ))}
          </G>
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={room.name}
        onBack={() => navigateTo('ActiveRooms')}
        onUpdate={() => setIsUpdating(!isUpdating)}
      />

      <FlatList
        data={updatedParticipants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) =>
          isUpdating ? (
            <View style={styles.participantRow}>
              <Text style={styles.participantName}>{item.name}</Text>
              {/* "In" Input */}
              <TextInput
                style={styles.input}
                placeholder="In"
                placeholderTextColor="#888"
                value={item.in || ''}
                onChangeText={(text) =>
                  setUpdatedParticipants((prev) =>
                    prev.map((p) =>
                      p.name === item.name ? { ...p, in: text } : p
                    )
                  )
                }
              />
              {/* "Out" Input */}
              <TextInput
                style={styles.input}
                placeholder="Out"
                placeholderTextColor="#888"
                value={item.out || ''}
                onChangeText={(text) =>
                  setUpdatedParticipants((prev) =>
                    prev.map((p) =>
                      p.name === item.name ? { ...p, out: text } : p
                    )
                  )
                }
              />
            </View>
          ) : (
            <View style={styles.participantRow}>
              <Text style={styles.participantName}>{item.name}</Text>
              <Text style={styles.participantDate}>
                {item.history && item.history.length > 0
                  ? item.history[item.history.length - 1].date
                  : 'No Data'}
              </Text>
              <Text style={styles.winLoss}>${item.winLoss.toFixed(2)}</Text>
            </View>
          )
        }
      />

      {isUpdating && (
        <TouchableOpacity
          style={[
            styles.confirmButton,
            totalIn !== totalOut && styles.disabledButton,
          ]}
          onPress={handleConfirmUpdate}
          disabled={totalIn !== totalOut}
        >
          <Text style={styles.confirmButtonText}>
            Confirm ({totalIn !== totalOut ? 'Mismatch' : 'Ready'})
          </Text>
        </TouchableOpacity>
      )}

      {!isUpdating && renderGraph()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  participantName: {
    color: '#fff',
    fontSize: 16,
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
  graphContainer: {
    marginTop: 20,
    height: 200,
    alignItems: 'center',
  },
  noDataText: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default RoomPage;
