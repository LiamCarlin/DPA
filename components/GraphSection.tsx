import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GraphSection(): JSX.Element {
  return (
    <View style={styles.graphContainer}>
      <Text style={styles.sectionTitle}>Recent Progress</Text>
      <View style={styles.graph}>
        <View style={styles.graphLine}>
          <View style={[styles.graphPoint, { bottom: 50 }]} />
          <View style={[styles.graphPoint, { bottom: 20 }]} />
          <View style={[styles.graphPoint, { bottom: 80 }]} />
          <View style={[styles.graphPoint, { bottom: 120 }]} />
          <View style={[styles.graphPoint, { bottom: 60 }]} />
          <View style={[styles.graphPoint, { bottom: 140 }]} />
          <View style={[styles.graphPoint, { bottom: 100 }]} />
        </View>
        <View style={styles.graphLabels}>
          <Text style={styles.graphLabel}>Mon</Text>
          <Text style={styles.graphLabel}>Tue</Text>
          <Text style={styles.graphLabel}>Wed</Text>
          <Text style={styles.graphLabel}>Thu</Text>
          <Text style={styles.graphLabel}>Fri</Text>
          <Text style={styles.graphLabel}>Sat</Text>
          <Text style={styles.graphLabel}>Sun</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  graphContainer: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  graph: {
    height: 150,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  graphLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  graphPoint: {
    width: 8,
    height: 8,
    backgroundColor: 'green',
    borderRadius: 4,
    position: 'absolute',
  },
  graphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  graphLabel: {
    color: '#fff',
    fontSize: 12,
  },
});
