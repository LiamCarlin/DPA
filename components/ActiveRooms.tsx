import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Room {
  name: string;
  players: number;
}

const rooms: Room[] = [
  { name: "Texas Hold'em Night", players: 4 },
  { name: 'The Boys', players: 8 },
  { name: 'Home Sweet Home', players: 4 },
];

export default function ActiveRooms(): JSX.Element {
  return (
    <View style={styles.roomsContainer}>
      <Text style={styles.sectionTitle}>Active Rooms</Text>
      {rooms.map((room, index) => (
        <View key={index} style={styles.room}>
          <Text style={styles.roomText}>{room.name}</Text>
          <Text style={styles.roomPlayers}>{room.players} players</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  roomsContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  room: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  roomText: {
    color: '#fff',
    fontSize: 16,
  },
  roomPlayers: {
    color: '#fff',
    fontSize: 16,
  },
});
