import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Header from '../components/Header';

interface StatisticsScreenProps {
  openMenu: () => void;
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ openMenu }) => {
  return (
    <View style={styles.container}>
      <Header onMenuPress={openMenu} />
      <Text style={styles.title}>Player Statistics</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Games Played:</Text>
          <Text style={styles.statValue}>45</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Wins:</Text>
          <Text style={styles.statValue}>20</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Win Rate:</Text>
          <Text style={styles.statValue}>44%</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Chips Won:</Text>
          <Text style={styles.statValue}>1250</Text>
        </View>
      </View>
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
  statsContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#fff',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default StatisticsScreen;
