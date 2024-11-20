import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ButtonSection(): JSX.Element {
  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>📸 Chip Counter</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>➕ Calculate Odds</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
