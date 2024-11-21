import React from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import Header from '../components/Header';

interface LeaderboardScreenProps {
  openMenu: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ openMenu }) => {
  const leaderboardData = [
    { id: '1', name: 'Player 1', score: 200 },
    { id: '2', name: 'Player 2', score: 180 },
    { id: '3', name: 'Player 3', score: 150 },
    { id: '4', name: 'Player 4', score: 120 },
    { id: '5', name: 'Player 5', score: 100 },
  ];

  const renderLeaderboardItem = ({ item }: { item: { name: string; score: number } }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.score}>{item.score} points</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header onMenuPress={openMenu} />
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 16,
  },
  score: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LeaderboardScreen;
