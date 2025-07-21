import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Plus, Users, Edit3, Trash2, X } from 'lucide-react-native';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  memberCount: number;
}

interface Member {
  name: string;
  email: string;
}

const CATEGORY_OPTIONS = {
  food: { label: 'Food & Dining', color: '#FF6B6B' },
  transport: { label: 'Transportation', color: '#4ECDC4' },
  housing: { label: 'Housing', color: '#45B7D1' },
  entertainment: { label: 'Entertainment', color: '#96CEB4' },
  travel: { label: 'Travel', color: '#FFEAA7' },
  other: { label: 'Other', color: '#DDA0DD' },
};

const GROUP_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#FFB347', '#87CEEB'
];

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          category: selectedCategory,
          color: selectedColor,
          members: members,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGroups([...groups, data.group]);
        // Reset form
        setGroupName('');
        setGroupDescription('');
        setSelectedCategory('food');
        setSelectedColor(GROUP_COLORS[0]);
        setMembers([]);
        setShowCreateModal(false);
        Alert.alert('Success', 'Group created successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const addMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      Alert.alert('Error', 'Please enter both name and email');
      return;
    }

    if (members.some(m => m.email === newMemberEmail)) {
      Alert.alert('Error', 'This email is already added');
      return;
    }

    setMembers([...members, { name: newMemberName, email: newMemberEmail }]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const removeMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      <ScrollView style={styles.content}>
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Groups Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first expense group to start splitting bills with friends
            </Text>
            <TouchableOpacity 
              style={styles.emptyCreateButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyCreateButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.groupsList}>
            {groups.map((group) => (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <View style={[styles.groupIcon, { backgroundColor: group.color }]}>
                    <Users size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupDescription}>{group.description}</Text>
                    <Text style={styles.groupMeta}>
                      {CATEGORY_OPTIONS[group.category as keyof typeof CATEGORY_OPTIONS]?.label || 'Other'} • {group.memberCount} members
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Group</Text>
            <TouchableOpacity 
              onPress={handleCreateGroup}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveButtonText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Group Name */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Group Name</Text>
              <TextInput
                style={styles.formInput}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="What's this group for?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Category */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {Object.entries(CATEGORY_OPTIONS).map(([key, option]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryOption,
                      selectedCategory === key && styles.categoryOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setSelectedCategory(key)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      selectedCategory === key && { color: option.color }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Color */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Group Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                {GROUP_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Members */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Members</Text>
              
              {/* Add Member Form */}
              <View style={styles.addMemberForm}>
                <TextInput
                  style={[styles.formInput, styles.memberInput]}
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                  placeholder="Member name"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={[styles.formInput, styles.memberInput]}
                  value={newMemberEmail}
                  onChangeText={setNewMemberEmail}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.addMemberButton} onPress={addMember}>
                  <Plus size={16} color="#0EA5E9" />
                </TouchableOpacity>
              </View>

              {/* Members List */}
              {members.map((member, index) => (
                <View key={index} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeMember(member.email)}
                    style={styles.removeMemberButton}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 32,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  emptyCreateButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  groupsList: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  groupMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  modalSaveButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryOption: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  categoryOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  colorScroll: {
    flexDirection: 'row',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#1F2937',
  },
  addMemberForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  memberInput: {
    flex: 1,
  },
  addMemberButton: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  memberEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  removeMemberButton: {
    padding: 4,
  },
}); 