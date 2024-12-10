import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  TextInput,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Make sure to install this package
import { auth, db } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  DocumentData,
  getDocs
} from 'firebase/firestore';
import Header from '../components/Header';

interface FriendRequest {
  id: string;
  senderId: string;
  senderEmail: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

interface Friend {
  id: string;
  email: string;
  username: string;
  profilePhoto: number | null;
  lastMessage?: string;
  lastMessageTime?: Date;
}

interface FriendsPageProps {
  openMenu: () => void;
  navigateTo: (screen: string) => void;
}

const profileImages = {
  1: require('../assets/profile-pictures/pic1.png'),
  2: require('../assets/profile-pictures/pic2.png'),
  3: require('../assets/profile-pictures/pic3.png'),
  4: require('../assets/profile-pictures/pic4.png'),
  5: require('../assets/profile-pictures/pic5.png'),
  placeholder: require('../assets/profile-placeholder.png')
};

const FriendsPage: React.FC<FriendsPageProps> = ({ openMenu, navigateTo }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // Listen for friend requests
    const friendRequestsRef = collection(db, 'friendRequests');
    const requestsQuery = query(friendRequestsRef, where('receiverId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests: FriendRequest[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as FriendRequest));
      setPendingRequests(requests);
    });

    // Fetch friends list
    const fetchFriends = async () => {
      const friendsRef = collection(db, 'friends');
      const friendsQuery = query(friendsRef, where('users', 'array-contains', currentUser.uid));
      
      onSnapshot(friendsQuery, async (snapshot) => {
        const friendsData = await Promise.all(snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const friendId = data.users.find((id: string) => id !== currentUser.uid);
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          const friendData = friendDoc.data();
          
          return {
            id: friendId,
            email: friendData?.email || '',
            username: friendData?.username || '',
            profilePhoto: friendData?.profilePhoto || null,
            lastMessage: data.lastMessage,
            lastMessageTime: data.lastMessageTime?.toDate()
          };
        }));
        setFriends(friendsData);
      });
    };

    fetchFriends();
    return () => unsubscribe();
  }, [currentUser]);

  const handleFriendRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (status === 'accepted' && requestSnap.exists()) {
        const requestData = requestSnap.data() as DocumentData;
        await addDoc(collection(db, 'friends'), {
          users: [requestData.senderId, requestData.receiverId],
          createdAt: serverTimestamp()
        });
      }
      
      await updateDoc(requestRef, { status });
    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  };

  const searchUser = async (email: string) => {
    if (!email) return;
    setIsLoading(true);
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        Alert.alert('User not found', 'No user found with this email');
        return;
      }

      const user = querySnapshot.docs[0];
      if (user.id === auth.currentUser?.uid) {
        Alert.alert('Error', 'You cannot send a friend request to yourself');
        return;
      }

      // Check if friend request already exists
      const friendRequestsRef = collection(db, 'friendRequests');
      const requestQuery = query(
        friendRequestsRef,
        where('senderId', '==', auth.currentUser?.uid),
        where('receiverId', '==', user.id)
      );
      
      const requestSnapshot = await getDocs(requestQuery);
      if (!requestSnapshot.empty) {
        Alert.alert('Request exists', 'Friend request already sent');
        return;
      }

      await sendFriendRequest(user.id);
      Alert.alert('Success', 'Friend request sent successfully');
      setIsModalVisible(false);
      
    } catch (error) {
      console.error('Error searching user:', error);
      Alert.alert('Error', 'Failed to search for user');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity style={styles.friendItem}>
      <Image 
        source={
          item.profilePhoto && profileImages[item.profilePhoto as keyof typeof profileImages]
            ? profileImages[item.profilePhoto as keyof typeof profileImages]
            : profileImages.placeholder
        }
        style={styles.profilePic}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username || item.email}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
      </View>
      <Text style={styles.timeStamp}>
        {item.lastMessageTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Friends" 
        onMenuPress={openMenu}  // Pass the openMenu function here
        rightComponent={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="person-add" size={24} color="#4ADE80" />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'friends' ? (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.requestsContainer}>
          {pendingRequests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <Text style={styles.requestText}>{request.senderEmail}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={() => handleFriendRequest(request.id, 'accepted')}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleFriendRequest(request.id, 'rejected')}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add Friend Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Friend</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter email address"
              placeholderTextColor="#666"
              value={searchEmail}
              onChangeText={setSearchEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={() => searchUser(searchEmail)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4ADE80',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4ADE80',
  },
  listContainer: {
    padding: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    marginBottom: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
  },
  timeStamp: {
    color: '#666',
    fontSize: 12,
  },
  requestsContainer: {
    padding: 15,
  },
  requestItem: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  requestText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4ADE80',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#2D3748',
    padding: 12,
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  sendButton: {
    backgroundColor: '#4ADE80',
  },
});

export default FriendsPage;