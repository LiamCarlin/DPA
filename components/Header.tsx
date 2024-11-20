import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function Header(): JSX.Element {
  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      <Text style={styles.title}>DPA</Text>
      <TouchableOpacity>
        <Image
            source={{ uri: 'https://via.placeholder.com/30' }} // Placeholder image URL
            style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
  },
});
