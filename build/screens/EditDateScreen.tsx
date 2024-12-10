import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Text, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Participant } from '../types';

const EditDateScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { participants } = route.params as { participants: Participant[] };
  const [updatedParticipants, setUpdatedParticipants] = useState([...participants]);

  const handleSave = () => {
    // Save the updated participants data
    // You can implement the save logic here
    Alert.alert('Success', 'Date entries updated successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={updatedParticipants}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.participantRow}>
            <Text style={styles.participantName}>{item.name}</Text>
            <FlatList
              data={item.history}
              keyExtractor={(historyItem, index) => index.toString()}
              renderItem={({ historyItem }) => (
                <View style={styles.historyRow}>
                  <Text style={styles.historyDate}>{historyItem.date}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="In"
                    placeholderTextColor="#888"
                    value={historyItem.in?.toString() || ''}
                    onChangeText={(text) => {
                      const newIn = parseFloat(text) || 0;
                      setUpdatedParticipants((prev) =>
                        prev.map((p) =>
                          p.name === item.name
                            ? {
                                ...p,
                                history: p.history.map((h) =>
                                  h.date === historyItem.date ? { ...h, in: newIn } : h
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
                    value={historyItem.out?.toString() || ''}
                    onChangeText={(text) => {
                      const newOut = parseFloat(text) || 0;
                      setUpdatedParticipants((prev) =>
                        prev.map((p) =>
                          p.name === item.name
                            ? {
                                ...p,
                                history: p.history.map((h) =>
                                  h.date === historyItem.date ? { ...h, out: newOut } : h
                                ),
                              }
                            : p
                        )
                      );
                    }}
                  />
                </View>
              )}
            />
          </View>
        )}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  participantName: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDate: {
    color: '#888',
    fontSize: 14,
    marginRight: 10,
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
  saveButton: {
    backgroundColor: '#4ADE80',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditDateScreen;