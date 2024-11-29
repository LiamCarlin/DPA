import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface HeaderProps {
  title?: string; // Optional title
  onMenuPress?: () => void; // Optional menu button action
  onBack?: () => void; // Optional back button action
  onUpdate?: () => void; // Optional update button action
  profileImageUrl?: string; // Optional profile image
  onProfilePress?: () => void; // Action when profile picture is clicked
}

const Header: React.FC<HeaderProps> = ({ 
  title = '', 
  onMenuPress, 
  onBack, 
  onUpdate, 
  profileImageUrl, 
  onProfilePress 
}) => {
  return (
    <View style={styles.header}>
      {/* Back Button or Hamburger Menu */}
      {onBack ? (
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      ) : (
        onMenuPress && (
          <TouchableOpacity onPress={onMenuPress}>
            <Text style={styles.menuButton}>☰</Text>
          </TouchableOpacity>
        )
      )}

      {/* Title */}
      {title ? <Text style={styles.title}>{title}</Text> : null}

      {/* Update Button */}
      {onUpdate && (
        <TouchableOpacity onPress={onUpdate}>
          <Text style={styles.updateButton}>Update</Text>
        </TouchableOpacity>
      )}

      {/* Profile Picture */}
      {profileImageUrl && (
        <TouchableOpacity onPress={onProfilePress}>
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E293B',
  },
  backButton: {
    fontSize: 20,
    color: '#fff',
  },
  menuButton: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  updateButton: {
    fontSize: 16,
    color: '#4ADE80',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
  },
});

export default Header;
