import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActiveRooms: React.FC = () => {
  const rooms = [
    { name: "Texas Hold'em Night", players: 4 },
    { name: 'The Boys', players: 8 },
    { name: 'Home Sweet Home', players: 4 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Rooms</Text>
      {rooms.map((room, index) => (
        <View key={index} style={styles.room}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomPlayers}>{room.players} players</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  room: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
  },
  roomPlayers: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ActiveRooms;
