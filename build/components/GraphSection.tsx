import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GraphSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Progress</Text>
      {/* Placeholder for the graph */}
      <View style={styles.graph}>
        <Text style={styles.graphPlaceholder}>[Graph Placeholder]</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  graph: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
  },
  graphPlaceholder: {
    color: '#fff',
  },
});

export default GraphSection;
