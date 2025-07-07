import React, { useState } from 'react';
import { usePlaidTransactions, useSpendingAnalysis } from '../../hooks/usePlaid';
import { plaidService } from '../../services/plaidService';
import { formatRelativeTime } from '../../utils/dateUtils';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { Plus, Users, ArrowUpRight, ArrowDownLeft, Zap, Brain, Check, X, DollarSign, Clock, MapPin, CreditCard, UserPlus, Send, Settings, Star, Calendar, Coffee, Plane, Chrome as Home, Utensils, Car, ShoppingBag, CreditCard as Edit3, Trash2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ExpenseGroup {
  id: string;
  name: string;
  description: string;
  category: 'dining' | 'travel' | 'living' | 'entertainment' | 'shopping' | 'transport' | 'general';
  members: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'admin' | 'member';
  }>;
  context: {
    keywords: string[];
    locations: string[];
    merchants: string[];
    timePreferences: string[];
  };
  stats: {
    totalExpenses: number;
    avgPerPerson: number;
    lastActivity: string;
    splitCount: number;
  };
  color: string;
  icon: any;
  createdAt: string;
  isActive: boolean;
}

interface SplitSuggestion {
  id: string;
  transactionId: string;
  amount: number;
  description: string;
  merchantName: string;
  date: string;
  confidence: number;
  matchedGroup: ExpenseGroup;
  matchReasons: string[];
  suggestedParticipants: Array<{
    id: string;
    name: string;
    confidence: number;
  }>;
  splitType: 'equal' | 'custom';
  amounts: { [userId: string]: number };
  status: 'pending' | 'accepted' | 'rejected';
}

const categoryIcons = {
  dining: Utensils,
  travel: Plane,
  living: Home,
  entertainment: Star,
  shopping: ShoppingBag,
  transport: Car,
  general: Users,
};

const categoryColors = {
  dining: '#EF4444',
  travel: '#0EA5E9',
  living: '#059669',
  entertainment: '#8B5CF6',
  shopping: '#F59E0B',
  transport: '#06B6D4',
  general: '#6B7280',
};

export default function WalletsScreen() {
  const userId = '1'; // In production, get from auth context
  const { data: transactionsData, loading: transactionsLoading, refetch } = usePlaidTransactions(userId, undefined, 20);
  const { data: analysisData } = useSpendingAnalysis(userId);
  
  const [activeTab, setActiveTab] = useState<'groups' | 'suggestions' | 'activity'>('groups');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ExpenseGroup | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'general' as ExpenseGroup['category'],
    keywords: '',
    locations: '',
    merchants: '',
  });

  const transactions = transactionsData?.transactions || [];

  // Mock expense groups with AI context
  const [expenseGroups, setExpenseGroups] = useState<ExpenseGroup[]>([
    {
      id: '1',
      name: 'Boston Trip Squad',
      description: 'Our amazing Boston adventure July 7-10',
      category: 'travel',
      members: [
        { id: '1', name: 'You', email: 'you@example.com', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'admin' },
        { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
        { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
        { id: '4', name: 'Emma Wilson', email: 'emma@example.com', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
      ],
      context: {
        keywords: ['boston', 'vacation', 'trip', 'hotel', 'flight', 'uber', 'restaurant'],
        locations: ['Boston', 'Logan Airport', 'Back Bay', 'North End', 'Cambridge'],
        merchants: ['Delta Airlines', 'Marriott', 'Uber', 'Lyft'],
        timePreferences: ['July 7-10, 2024'],
      },
      stats: {
        totalExpenses: 2847.50,
        avgPerPerson: 711.88,
        lastActivity: '2 hours ago',
        splitCount: 12,
      },
      color: '#0EA5E9',
      icon: Plane,
      createdAt: '2024-06-01',
      isActive: true,
    },
    {
      id: '2',
      name: 'Roommate Expenses',
      description: 'Shared apartment costs and utilities',
      category: 'living',
      members: [
        { id: '1', name: 'You', email: 'you@example.com', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'admin' },
        { id: '5', name: 'Alex Kim', email: 'alex@example.com', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
        { id: '6', name: 'Jordan Taylor', email: 'jordan@example.com', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
      ],
      context: {
        keywords: ['rent', 'utilities', 'electricity', 'gas', 'internet', 'groceries', 'cleaning'],
        locations: ['Home', 'Apartment', 'Local grocery stores'],
        merchants: ['PG&E', 'Comcast', 'Whole Foods', 'Safeway', 'Target'],
        timePreferences: ['Monthly recurring'],
      },
      stats: {
        totalExpenses: 1234.80,
        avgPerPerson: 411.60,
        lastActivity: '1 day ago',
        splitCount: 8,
      },
      color: '#059669',
      icon: Home,
      createdAt: '2024-02-01',
      isActive: true,
    },
    {
      id: '3',
      name: 'Friday Night Dinners',
      description: 'Weekly dinner group adventures',
      category: 'dining',
      members: [
        { id: '1', name: 'You', email: 'you@example.com', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'admin' },
        { id: '7', name: 'Lisa Park', email: 'lisa@example.com', avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
        { id: '8', name: 'David Chen', email: 'david@example.com', avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
        { id: '9', name: 'Maya Patel', email: 'maya@example.com', avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'member' },
      ],
      context: {
        keywords: ['dinner', 'restaurant', 'food', 'drinks', 'friday', 'weekend'],
        locations: ['Downtown', 'Mission District', 'Castro', 'SOMA'],
        merchants: ['OpenTable restaurants', 'Local eateries'],
        timePreferences: ['Friday evenings', 'Weekend dinners'],
      },
      stats: {
        totalExpenses: 856.30,
        avgPerPerson: 214.08,
        lastActivity: '3 days ago',
        splitCount: 15,
      },
      color: '#EF4444',
      icon: Utensils,
      createdAt: '2024-03-15',
      isActive: true,
    },
  ]);

  // Generate AI split suggestions based on groups
  const generateSplitSuggestions = (): SplitSuggestion[] => {
    const splittableTransactions = transactions.filter(t => 
      t.amount < 0 && 
      (t.category?.includes('Food and Drink') || 
       t.category?.includes('Transportation') || 
       t.category?.includes('Entertainment') ||
       t.merchantName?.toLowerCase().includes('restaurant') ||
       t.merchantName?.toLowerCase().includes('uber') ||
       t.merchantName?.toLowerCase().includes('lyft'))
    );

    return splittableTransactions.slice(0, 5).map(t => {
      // Find matching group based on context
      let matchedGroup = expenseGroups[0]; // Default
      let confidence = 0.5;
      let matchReasons: string[] = [];

      for (const group of expenseGroups) {
        let groupConfidence = 0;
        const reasons: string[] = [];

        // Check keywords
        const description = (t.description + ' ' + (t.merchantName || '')).toLowerCase();
        for (const keyword of group.context.keywords) {
          if (description.includes(keyword.toLowerCase())) {
            groupConfidence += 0.3;
            reasons.push(`Matches keyword: ${keyword}`);
          }
        }

        // Check merchants
        for (const merchant of group.context.merchants) {
          if (t.merchantName?.toLowerCase().includes(merchant.toLowerCase())) {
            groupConfidence += 0.4;
            reasons.push(`Known merchant: ${merchant}`);
          }
        }

        // Check category alignment
        if (group.category === 'dining' && t.category?.includes('Food and Drink')) {
          groupConfidence += 0.2;
          reasons.push('Category: Dining expense');
        }
        if (group.category === 'transport' && t.category?.includes('Transportation')) {
          groupConfidence += 0.2;
          reasons.push('Category: Transportation expense');
        }

        if (groupConfidence > confidence) {
          confidence = groupConfidence;
          matchedGroup = group;
          matchReasons = reasons;
        }
      }

      const amount = Math.abs(t.amount);
      const participantCount = matchedGroup.members.length;
      const equalAmount = amount / participantCount;

      return {
        id: `split_${t.id}`,
        transactionId: t.id,
        amount,
        description: t.description,
        merchantName: t.merchantName || 'Unknown Merchant',
        date: t.date,
        confidence: Math.min(confidence, 0.95),
        matchedGroup,
        matchReasons,
        suggestedParticipants: matchedGroup.members.map(m => ({
          id: m.id,
          name: m.name,
          confidence: m.id === '1' ? 1.0 : 0.85 + Math.random() * 0.1,
        })),
        splitType: 'equal',
        amounts: matchedGroup.members.reduce((acc, member) => {
          acc[member.id] = equalAmount;
          return acc;
        }, {} as { [userId: string]: number }),
        status: 'pending'
      };
    });
  };

  const splitSuggestions = generateSplitSuggestions();

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return;

    const group: ExpenseGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      category: newGroup.category,
      members: [
        { id: '1', name: 'You', email: 'you@example.com', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', role: 'admin' }
      ],
      context: {
        keywords: newGroup.keywords.split(',').map(k => k.trim()).filter(k => k),
        locations: newGroup.locations.split(',').map(l => l.trim()).filter(l => l),
        merchants: newGroup.merchants.split(',').map(m => m.trim()).filter(m => m),
        timePreferences: [],
      },
      stats: {
        totalExpenses: 0,
        avgPerPerson: 0,
        lastActivity: 'Just created',
        splitCount: 0,
      },
      color: categoryColors[newGroup.category],
      icon: categoryIcons[newGroup.category],
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setExpenseGroups(prev => [group, ...prev]);
    setNewGroup({ name: '', description: '', category: 'general', keywords: '', locations: '', merchants: '' });
    setShowCreateGroupModal(false);
  };

  const handleAcceptSplit = async (suggestion: SplitSuggestion) => {
    try {
      Alert.alert('Split Accepted', `Split request sent to ${suggestion.matchedGroup.name} members!`);
      refetch();
    } catch (error) {
      console.error('Failed to create split:', error);
      Alert.alert('Error', 'Failed to create split. Please try again.');
    }
  };

  const renderGroupCard = (group: ExpenseGroup) => {
    const IconComponent = group.icon;
    
    return (
      <TouchableOpacity 
        key={group.id} 
        style={[styles.groupCard, { borderLeftColor: group.color }]}
        onPress={() => {
          setSelectedGroup(group);
          setShowGroupDetailsModal(true);
        }}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupLeft}>
            <View style={[styles.groupIcon, { backgroundColor: group.color + '20' }]}>
              <IconComponent size={20} color={group.color} />
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupDescription}>{group.description}</Text>
              <View style={styles.groupMeta}>
                <Users size={12} color="#6B7280" />
                <Text style={styles.groupMembers}>{group.members.length} members</Text>
                <View style={styles.groupActivity}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.groupLastActivity}>{group.stats.lastActivity}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.groupRight}>
            <Text style={styles.groupTotal}>${group.stats.totalExpenses.toFixed(2)}</Text>
            <Text style={styles.groupSplits}>{group.stats.splitCount} splits</Text>
          </View>
        </View>

        <View style={styles.groupMembers}>
          <View style={styles.memberAvatars}>
            {group.members.slice(0, 4).map((member, index) => (
              <Image
                key={member.id}
                source={{ uri: member.avatar }}
                style={[styles.memberAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
              />
            ))}
            {group.members.length > 4 && (
              <View style={[styles.memberAvatar, styles.memberAvatarMore]}>
                <Text style={styles.memberAvatarMoreText}>+{group.members.length - 4}</Text>
              </View>
            )}
          </View>
          <View style={styles.groupContext}>
            <Text style={styles.contextLabel}>AI Context:</Text>
            <View style={styles.contextTags}>
              {group.context.keywords.slice(0, 3).map((keyword, index) => (
                <View key={index} style={styles.contextTag}>
                  <Text style={styles.contextTagText}>{keyword}</Text>
                </View>
              ))}
              {group.context.keywords.length > 3 && (
                <View style={styles.contextTag}>
                  <Text style={styles.contextTagText}>+{group.context.keywords.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSuggestionCard = (suggestion: SplitSuggestion) => (
    <View key={suggestion.id} style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <View style={styles.suggestionLeft}>
          <View style={styles.transactionIcon}>
            <ArrowUpRight size={16} color="#DC2626" />
          </View>
          <View style={styles.suggestionInfo}>
            <Text style={styles.suggestionMerchant}>{suggestion.merchantName}</Text>
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            <View style={styles.suggestionMeta}>
              <MapPin size={12} color="#6B7280" />
              <Text style={styles.suggestionDate}>{formatRelativeTime(suggestion.date)}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.suggestionAmount}>${suggestion.amount.toFixed(2)}</Text>
      </View>

      <View style={styles.matchedGroupSection}>
        <View style={styles.matchedGroupHeader}>
          <View style={styles.matchedGroupInfo}>
            <View style={[styles.matchedGroupIcon, { backgroundColor: suggestion.matchedGroup.color + '20' }]}>
              <suggestion.matchedGroup.icon size={16} color={suggestion.matchedGroup.color} />
            </View>
            <View>
              <Text style={styles.matchedGroupName}>Matched: {suggestion.matchedGroup.name}</Text>
              <View style={styles.confidenceBadge}>
                <Brain size={10} color="#0EA5E9" />
                <Text style={styles.confidenceText}>{Math.round(suggestion.confidence * 100)}% confident</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.matchReasons}>
          {suggestion.matchReasons.slice(0, 2).map((reason, index) => (
            <View key={index} style={styles.matchReason}>
              <Check size={10} color="#059669" />
              <Text style={styles.matchReasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.participantsSection}>
        <Text style={styles.participantsTitle}>Split with:</Text>
        <View style={styles.participantsList}>
          {suggestion.suggestedParticipants.map((participant) => (
            <View key={participant.id} style={styles.participantChip}>
              <View style={styles.participantAvatar}>
                <Text style={styles.participantInitial}>{participant.name[0]}</Text>
              </View>
              <Text style={styles.participantName}>{participant.name}</Text>
              <Text style={styles.participantAmount}>
                ${suggestion.amounts[participant.id]?.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.suggestionActions}>
        <TouchableOpacity style={styles.rejectButton}>
          <X size={16} color="#DC2626" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.customizeButton}>
          <Edit3 size={16} color="#6B7280" />
          <Text style={styles.customizeButtonText}>Customize</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => handleAcceptSplit(suggestion)}
        >
          <Check size={16} color="#FFFFFF" />
          <Text style={styles.acceptButtonText}>Accept & Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (transactionsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Smart Groups</Text>
            <Text style={styles.headerSubtitle}>AI-powered expense splitting</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateGroupModal(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* AI Insights Banner */}
        <View style={styles.insightsBanner}>
          <View style={styles.insightsIcon}>
            <Brain size={20} color="#0EA5E9" />
          </View>
          <View style={styles.insightsContent}>
            <Text style={styles.insightsTitle}>AI Analysis Active</Text>
            <Text style={styles.insightsDescription}>
              Found {splitSuggestions.length} expenses ready to split across your groups
            </Text>
          </View>
          <TouchableOpacity style={styles.insightsAction}>
            <Zap size={16} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {(['groups', 'suggestions', 'activity'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'suggestions' && ` (${splitSuggestions.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content based on active tab */}
        <View style={styles.tabContent}>
          {activeTab === 'groups' && (
            <View style={styles.groupsContent}>
              {expenseGroups.length === 0 ? (
                <View style={styles.emptyState}>
                  <Users size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
                  <Text style={styles.emptyStateDescription}>
                    Create your first expense group to start smart splitting
                  </Text>
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => setShowCreateGroupModal(true)}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.emptyStateButtonText}>Create Group</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.groupsList}>
                  {expenseGroups.map(renderGroupCard)}
                </View>
              )}
            </View>
          )}

          {activeTab === 'suggestions' && (
            <View style={styles.suggestionsContent}>
              {splitSuggestions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Brain size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>No Split Suggestions</Text>
                  <Text style={styles.emptyStateDescription}>
                    AI is analyzing your transactions. Check back soon for smart splitting suggestions.
                  </Text>
                </View>
              ) : (
                <View style={styles.suggestionsList}>
                  <Text style={styles.sectionTitle}>Smart Split Suggestions</Text>
                  <Text style={styles.sectionDescription}>
                    AI matched these expenses to your groups based on context and patterns.
                  </Text>
                  {splitSuggestions.map(renderSuggestionCard)}
                </View>
              )}
            </View>
          )}

          {activeTab === 'activity' && (
            <View style={styles.activityContent}>
              <View style={styles.emptyState}>
                <Clock size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Recent Activity</Text>
                <Text style={styles.emptyStateDescription}>
                  Group expense activity will appear here.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateGroupModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateGroupModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateGroupModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Group</Text>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleCreateGroup}
            >
              <Text style={styles.saveButtonText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Group Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newGroup.name}
                onChangeText={(text) => setNewGroup(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Boston Trip Squad, Roommate Expenses"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={newGroup.description}
                onChangeText={(text) => setNewGroup(prev => ({ ...prev, description: text }))}
                placeholder="Brief description of this group's purpose"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                {Object.entries(categoryIcons).map(([key, IconComponent]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryOption,
                      newGroup.category === key && styles.selectedCategoryOption,
                      { borderColor: categoryColors[key as keyof typeof categoryColors] }
                    ]}
                    onPress={() => setNewGroup(prev => ({ ...prev, category: key as ExpenseGroup['category'] }))}
                  >
                    <IconComponent 
                      size={20} 
                      color={newGroup.category === key ? '#FFFFFF' : categoryColors[key as keyof typeof categoryColors]} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      newGroup.category === key && styles.selectedCategoryOptionText
                    ]}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.aiContextSection}>
              <Text style={styles.aiContextTitle}>AI Context (Help AI identify expenses)</Text>
              <Text style={styles.aiContextDescription}>
                Provide keywords, locations, and merchants to help AI automatically detect and suggest splits for this group.
              </Text>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Keywords</Text>
                <TextInput
                  style={styles.formInput}
                  value={newGroup.keywords}
                  onChangeText={(text) => setNewGroup(prev => ({ ...prev, keywords: text }))}
                  placeholder="e.g., dinner, restaurant, vacation, hotel (comma separated)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Locations</Text>
                <TextInput
                  style={styles.formInput}
                  value={newGroup.locations}
                  onChangeText={(text) => setNewGroup(prev => ({ ...prev, locations: text }))}
                  placeholder="e.g., Boston, Downtown, Mission District (comma separated)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Merchants</Text>
                <TextInput
                  style={styles.formInput}
                  value={newGroup.merchants}
                  onChangeText={(text) => setNewGroup(prev => ({ ...prev, merchants: text }))}
                  placeholder="e.g., Uber, Marriott, OpenTable (comma separated)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Group Details Modal */}
      <Modal
        visible={showGroupDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGroupDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGroupDetailsModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedGroup?.name}</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {selectedGroup && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.groupDetailsHeader}>
                <View style={[styles.groupDetailsIcon, { backgroundColor: selectedGroup.color + '20' }]}>
                  <selectedGroup.icon size={24} color={selectedGroup.color} />
                </View>
                <Text style={styles.groupDetailsName}>{selectedGroup.name}</Text>
                <Text style={styles.groupDetailsDescription}>{selectedGroup.description}</Text>
              </View>

              <View style={styles.groupStats}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>${selectedGroup.stats.totalExpenses.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Total Expenses</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{selectedGroup.stats.splitCount}</Text>
                  <Text style={styles.statLabel}>Splits</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>${selectedGroup.stats.avgPerPerson.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Avg/Person</Text>
                </View>
              </View>

              <View style={styles.membersSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Members ({selectedGroup.members.length})</Text>
                  <TouchableOpacity style={styles.addMemberButton}>
                    <UserPlus size={16} color="#0EA5E9" />
                    <Text style={styles.addMemberText}>Add</Text>
                  </TouchableOpacity>
                </View>
                {selectedGroup.members.map((member) => (
                  <View key={member.id} style={styles.memberRow}>
                    <Image source={{ uri: member.avatar }} style={styles.memberRowAvatar} />
                    <View style={styles.memberRowInfo}>
                      <Text style={styles.memberRowName}>{member.name}</Text>
                      <Text style={styles.memberRowEmail}>{member.email}</Text>
                    </View>
                    <View style={styles.memberRowRole}>
                      <Text style={[
                        styles.memberRoleText,
                        { color: member.role === 'admin' ? '#0EA5E9' : '#6B7280' }
                      ]}>
                        {member.role}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.contextSection}>
                <Text style={styles.sectionTitle}>AI Context</Text>
                <View style={styles.contextGrid}>
                  <View style={styles.contextItem}>
                    <Text style={styles.contextItemLabel}>Keywords</Text>
                    <View style={styles.contextTags}>
                      {selectedGroup.context.keywords.map((keyword, index) => (
                        <View key={index} style={styles.contextTag}>
                          <Text style={styles.contextTagText}>{keyword}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.contextItem}>
                    <Text style={styles.contextItemLabel}>Locations</Text>
                    <View style={styles.contextTags}>
                      {selectedGroup.context.locations.map((location, index) => (
                        <View key={index} style={styles.contextTag}>
                          <Text style={styles.contextTagText}>{location}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.contextItem}>
                    <Text style={styles.contextItemLabel}>Merchants</Text>
                    <View style={styles.contextTags}>
                      {selectedGroup.context.merchants.map((merchant, index) => (
                        <View key={index} style={styles.contextTag}>
                          <Text style={styles.contextTagText}>{merchant}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  insightsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightsContent: {
    flex: 1,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  insightsDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  insightsAction: {
    padding: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  activeTabButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 24,
  },
  groupsContent: {
    marginBottom: 32,
  },
  groupsList: {
    gap: 16,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  groupLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 6,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupMembers: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  groupActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupLastActivity: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  groupRight: {
    alignItems: 'flex-end',
  },
  groupTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  groupSplits: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberAvatarMore: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarMoreText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  groupContext: {
    flex: 1,
  },
  contextLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  contextTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  contextTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  contextTagText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  suggestionsContent: {
    marginBottom: 32,
  },
  suggestionsList: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  suggestionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionMerchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 6,
  },
  suggestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionDate: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  suggestionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: 'Inter-Bold',
  },
  matchedGroupSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  matchedGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchedGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  matchedGroupIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  matchedGroupName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  confidenceText: {
    fontSize: 10,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  matchReasons: {
    gap: 4,
  },
  matchReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchReasonText: {
    fontSize: 12,
    color: '#059669',
    fontFamily: 'Inter-Regular',
  },
  participantsSection: {
    marginBottom: 16,
  },
  participantsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  participantsList: {
    gap: 8,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  participantName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
  participantAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    gap: 4,
    minWidth: 60,
    height: 32,
  },
  rejectButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#DC2626',
    fontFamily: 'Inter-Medium',
  },
  customizeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 4,
    height: 32,
  },
  customizeButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0EA5E9',
    gap: 4,
    minWidth: 100,
    height: 32,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  activityContent: {
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  settingsButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    marginHorizontal: -12,
  },
  categoryOption: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    minWidth: 80,
  },
  selectedCategoryOption: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  categoryOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  selectedCategoryOptionText: {
    color: '#FFFFFF',
  },
  aiContextSection: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  aiContextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  aiContextDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  groupDetailsHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 24,
  },
  groupDetailsIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupDetailsName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  groupDetailsDescription: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  membersSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addMemberText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberRowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberRowInfo: {
    flex: 1,
  },
  memberRowName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  memberRowEmail: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  memberRowRole: {
    alignItems: 'flex-end',
  },
  memberRoleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  contextSection: {
    marginBottom: 32,
  },
  contextGrid: {
    gap: 16,
  },
  contextItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  contextItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
});