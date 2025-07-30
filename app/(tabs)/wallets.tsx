import React, { useState, useEffect } from 'react';
import { usePlaidTransactions } from '../../hooks/usePlaid';
import { formatRelativeTime } from '../../utils/dateUtils';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { Plus, Brain, Check, X, DollarSign, MapPin, ArrowUpRight, Edit3, Zap, Users, Utensils, Car, Home, Film, Plane, Tag, TrendingUp, PiggyBank } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

interface SplitSuggestion {
  id: string;
  transactionId: string;
  amount: number;
  description: string;
  merchantName: string;
  date: string;
  confidence: number;
  matchedGroup: any;
  groupSuggestions?: Array<{
    group: any;
    confidence: number;
    reasoning: string;
    matchingFactors: string[];
  }>;
  reasoning?: string;
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

// Groups state
interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  memberCount: number;
  balance?: number; // Your balance in this group (positive = owed money, negative = you owe)
  totalSpent?: number; // Total group spending
  savings?: number; // Group savings amount
  tripDate?: string; // For travel groups
  createdDate?: string; // When group was created
}

export default function WalletsScreen() {
  const router = useRouter();
  const userId = '1';

  // Plaid transactions for Suggestions & Activity tabs
  const { data: transactionsData, loading: transactionsLoading, refetch } =
    usePlaidTransactions(userId, undefined, 20);

  const CATEGORY_OPTIONS = {
    dining: { label: 'Dining & Food', color: '#EF4444' },
    transport: { label: 'Transportation', color: '#3B82F6' },
    household: { label: 'Household', color: '#10B981' },
    entertainment: { label: 'Entertainment', color: '#8B5CF6' },
    travel: { label: 'Travel', color: '#F59E0B' },
    other: { label: 'Other', color: '#6B7280' },
  } as const;

  const CATEGORY_ICONS = {
    dining: Utensils,
    transport: Car,
    household: Home,
    entertainment: Film,
    travel: Plane,
    other: Tag,
  } as const;

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const fetchGroups = async () => {
      try {
        setGroupsLoading(true);
        console.log('🔄 Wallets: Fetching groups from API...');
        
        // Fetch actual groups from API
        const response = await fetch('/api/groups?userId=1');
        const result = await response.json();
        
        console.log('📡 Wallets: API Response:', result);
        
        if (result.success && result.groups) {
          console.log('✅ Wallets: API returned groups:', result.groups.length, result.groups.map((g: any) => g.name));
          
          // Add financial data to API groups (since the API groups don't have it yet)
          const groupsWithFinancials = result.groups.map((group: any, index: number) => {
            const mockFinancials = [
              { balance: 127.45, totalSpent: 2847.80, savings: 1250 },
              { balance: -85.60, totalSpent: 1892.45, savings: 2400 },
              { balance: 156.30, totalSpent: 1876.50, savings: 1100 },
              { balance: 234.75, totalSpent: 1634.90, savings: 890 },
              { balance: -43.20, totalSpent: 956.30, savings: 675 }
            ];
            
            const financials = mockFinancials[index % mockFinancials.length];
            
            return {
              ...group,
              balance: financials.balance,
              totalSpent: financials.totalSpent,
              savings: financials.savings,
              createdDate: group.created_at ? group.created_at.split('T')[0] : '2024-01-15'
            };
          });
          
          console.log('✅ Wallets: Successfully loaded groups:', groupsWithFinancials.length, groupsWithFinancials.map((g: any) => g.name));
          setGroups(groupsWithFinancials);
          
          // Show alert with newest group
          if (groupsWithFinancials.length > 5) {
            const newestGroup = groupsWithFinancials[groupsWithFinancials.length - 1];
            console.log('🆕 Wallets: Newest group detected:', newestGroup.name);
          }
        } else {
          console.log('API failed, using fallback mock data');
          // Fallback to mock data if API fails
          const mockGroups = [
            {
              id: 'group_001',
              name: 'Foodie Friends',
              description: 'Weekly dinner adventures',
              category: 'dining',
              color: '#EF4444',
              memberCount: 4,
              balance: 127.45,
              totalSpent: 2847.80,
              savings: 1250,
              createdDate: '2024-01-15'
            },
            {
              id: 'group_002', 
              name: 'House Squad',
              description: 'Shared household expenses',
              category: 'household',
              color: '#10B981',
              memberCount: 3,
              balance: -85.60,
              totalSpent: 1892.45,
              savings: 2400,
              createdDate: '2024-02-01'
            },
            {
              id: 'group_003',
              name: 'SFO to Moab Trip',
              description: 'Epic road trip adventure',
              category: 'travel',
              color: '#F59E0B',
              memberCount: 4,
              balance: 156.30,
              totalSpent: 1876.50,
              savings: 1100,
              tripDate: '2024-04-15',
              createdDate: '2024-01-20'
            },
            {
              id: 'group_004',
              name: 'Road Trip Crew',
              description: 'Gas, tolls, and snacks',
              category: 'transport',
              color: '#3B82F6',
              memberCount: 5,
              balance: 234.75,
              totalSpent: 1634.90,
              savings: 890,
              createdDate: '2024-02-10'
            },
            {
              id: 'group_005',
              name: 'Weekend Warriors',
              description: 'Entertainment and activities',
              category: 'entertainment',
              color: '#8B5CF6',
              memberCount: 6,
              balance: -43.20,
              totalSpent: 956.30,
              savings: 675,
              createdDate: '2024-01-25'
            }
          ];
          setGroups(mockGroups);
        }
        
        setGroupsLoading(false);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroupsLoading(false);
      }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Refresh groups when tab comes into focus (to show newly created groups)
  useFocusEffect(
    React.useCallback(() => {
      fetchGroups();
    }, [])
  );
  
  const [activeTab, setActiveTab] = useState<'groups' | 'suggestions' | 'activity'>('groups');
  
  const transactions = (transactionsData as any)?.transactions || [];

  // Real AI split suggestions state
  const [splitSuggestions, setSplitSuggestions] = useState<SplitSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);



    // Fetch real AI split suggestions
  useEffect(() => {
    const fetchSplitSuggestions = async () => {
      try {
        setSuggestionsLoading(true);
        
        // Get recent transactions and generate AI suggestions for them
        const recentTransactions = transactions.slice(0, 10); // Process top 10 transactions for more suggestions
        const suggestions = [];
        
        for (const transaction of recentTransactions) {
          try {
            const response = await fetch(`/api/plaid/split-suggestions?transactionId=${transaction.id}&userId=00000000-0000-0000-0000-000000000001`);
            const data = await response.json();
            
            if (data.success && data.suggestion) {
              const suggestion = {
                id: data.suggestion.id,
                transactionId: transaction.id,
                amount: Math.abs(transaction.amount),
                description: transaction.description,
                merchantName: transaction.merchantName || 'Unknown',
                date: transaction.date,
                confidence: data.suggestion.confidence,
                matchedGroup: data.suggestion.matchedGroup,
                groupSuggestions: data.suggestion.groupSuggestions || [],
                reasoning: data.suggestion.reasoning,
                matchReasons: data.suggestion.categories || [],
                suggestedParticipants: data.suggestion.suggestedParticipants || [],
                splitType: data.suggestion.splitType,
                amounts: data.suggestion.amounts || {},
                status: 'pending' as 'pending' | 'accepted' | 'rejected'
              };
              suggestions.push(suggestion);
            }
          } catch (error) {
            console.error('Error fetching split suggestion for transaction:', transaction.id, error);
          }
        }
        
        setSplitSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching split suggestions:', error);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    if (transactions.length > 0) {
      fetchSplitSuggestions();
    }
  }, [transactions]);



  const handleAcceptSplit = (suggestion: SplitSuggestion) => {
    Alert.alert('Split Accepted', `Split request sent to ${suggestion.matchedGroup.name} members!`);
    refetch();
  };

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
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Smart Groups</Text>
            <Text style={styles.headerSubtitle}>AI-powered expense splitting</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchGroups}
            >
              <Text style={styles.refreshText}>↻</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/groups')}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Overview */}
        {!groupsLoading && groups.length > 0 && (
          <View style={styles.balanceOverview}>
            <View style={styles.overviewCard}>
              <View style={styles.overviewItem}>
                <TrendingUp size={20} color="#10B981" />
                <Text style={styles.overviewValue}>
                  ${groups.reduce((total, group) => total + Math.abs(group.balance || 0), 0).toFixed(2)}
                </Text>
                <Text style={styles.overviewLabel}>Total Balance</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <PiggyBank size={20} color="#0EA5E9" />
                <Text style={styles.overviewValue}>
                  ${groups.reduce((total, group) => total + (group.savings || 0), 0).toLocaleString()}
                </Text>
                <Text style={styles.overviewLabel}>Group Savings</Text>
              </View>
              <View style={styles.overviewDivider} />
              <View style={styles.overviewItem}>
                <DollarSign size={20} color="#6B7280" />
                <Text style={styles.overviewValue}>
                  ${groups.reduce((total, group) => total + (group.totalSpent || 0), 0).toLocaleString()}
                </Text>
                <Text style={styles.overviewLabel}>Total Spent</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {(['groups', 'suggestions', 'activity'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text 
                style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {tab === 'suggestions' ? `Suggests (${splitSuggestions.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'suggestions' && (
            <View style={styles.suggestionsContent}>
              <Text style={styles.sectionTitle}>Smart Split Suggestions</Text>
              <Text style={styles.sectionDescription}>
                GPT analyzed these expenses and found multiple group matches for you to choose from.
              </Text>

              {suggestionsLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Getting AI suggestions...</Text>
                </View>
              ) : splitSuggestions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Brain size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>No Suggestions Available</Text>
                  <Text style={styles.emptyStateDescription}>
                    {transactions.length > 0 
                      ? `Processed ${transactions.length} transactions but got no suggestions. Check console logs.`
                      : 'Make some transactions and I\'ll suggest smart splits!'
                    }
                  </Text>
                </View>
              ) : (
                splitSuggestions.map((suggestion) => (
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

                    {/* AI Reasoning */}
                    {suggestion.reasoning && (
                      <View style={styles.reasoningCard}>
                        <Brain size={12} color="#0EA5E9" />
                        <Text style={styles.reasoningText}>{suggestion.reasoning}</Text>
                      </View>
                    )}

                    {/* Multiple Group Suggestions */}
                    {suggestion.groupSuggestions && suggestion.groupSuggestions.filter(groupSugg => groupSugg.confidence >= 0.70).length > 0 ? (
                      <View style={styles.groupOptionsContainer}>
                        <Text style={styles.groupOptionsTitle}>Choose a group:</Text>
                        {suggestion.groupSuggestions.filter(groupSugg => groupSugg.confidence >= 0.70).map((groupSugg, index) => (
                          <TouchableOpacity key={index} style={styles.groupOptionCard}>
                            <View style={styles.groupOptionLeft}>
                              <View style={[styles.groupOptionIcon, { backgroundColor: groupSugg.group.color || '#6B7280' }]}>
                                <Users size={14} color="#FFFFFF" />
                              </View>
                              <View style={styles.groupOptionInfo}>
                                <Text style={styles.groupOptionName}>{groupSugg.group.name}</Text>
                                <Text style={styles.groupOptionReasoning}>{groupSugg.reasoning}</Text>
                                <View style={styles.matchingFactors}>
                                  {groupSugg.matchingFactors?.slice(0, 2).map((factor, idx) => (
                                    <View key={idx} style={styles.factorChip}>
                                      <Text style={styles.factorText}>{factor.replace('_', ' ')}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            </View>
                            <View style={styles.confidenceBadge}>
                              <Text style={styles.confidenceText}>{Math.round(groupSugg.confidence * 100)}%</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.confidenceBadge}>
                        <Brain size={12} color="#0EA5E9" />
                        <Text style={styles.confidenceText}>{Math.round(suggestion.confidence * 100)}% confident</Text>
                      </View>
                    )}

                    <View style={styles.suggestionActions}>
                      <TouchableOpacity style={styles.rejectButton}>
                        <X size={16} color="#DC2626" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.customizeButton}>
                        <Edit3 size={16} color="#6B7280" />
                        <Text style={styles.customizeButtonText}>Edit</Text>
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
                ))
              )}
            </View>
          )}

          {activeTab === 'groups' && (
            groupsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading groups...</Text>
              </View>
            ) : groups.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
                <Text style={styles.emptyStateDescription}>Tap + to create your first expense group.</Text>
              </View>
            ) : (
              <View style={styles.groupsList}>
                {groups.map((group) => {
                  const meta = CATEGORY_OPTIONS[group.category as keyof typeof CATEGORY_OPTIONS] || CATEGORY_OPTIONS.other;
                  return (
                    <TouchableOpacity key={group.id} style={styles.groupCard} onPress={() => {
                      router.push({ pathname: '/group/[id]', params: { id: group.id } });
                    }}> 
                      <View style={styles.groupHeader}>
                        <View style={[styles.groupIcon, { backgroundColor: group.color }]}> 
                          {(() => {
                            const IconComponent = (CATEGORY_ICONS as any)[group.category] || Users;
                            return <IconComponent size={18} color="#FFFFFF" />;
                          })()}
                        </View>
                        <View style={styles.groupInfo}>
                          <Text style={styles.groupName}>{group.name}</Text>
                          <Text style={styles.groupDescription}>{group.description}</Text>
                          <Text style={[styles.groupMeta, { color: meta.color }]}>
                            {meta.label} • {group.memberCount} members
                            {group.tripDate && ` • Trip: ${new Date(group.tripDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          </Text>
                        </View>
                        <View style={styles.groupStats}>
                          <View style={styles.groupBalance}>
                            <Text style={[
                              styles.balanceAmount,
                              { color: (group.balance || 0) >= 0 ? '#10B981' : '#EF4444' }
                            ]}>
                              {(group.balance || 0) >= 0 ? '+' : ''}${Math.abs(group.balance || 0).toFixed(2)}
                            </Text>
                            <Text style={styles.balanceLabel}>
                              {(group.balance || 0) >= 0 ? 'owed to you' : 'you owe'}
                            </Text>
                          </View>
                          <View style={styles.groupSavings}>
                            <Text style={styles.savingsAmount}>
                              ${(group.savings || 0).toLocaleString()}
                            </Text>
                            <Text style={styles.savingsLabel}>saved</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          )}

          {activeTab === 'activity' && (
            <View style={styles.emptyState}>
              <DollarSign size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No Recent Activity</Text>
              <Text style={styles.emptyStateDescription}>
                Group expense activity will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 100,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: '#6B7280',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#0EA5E9',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsBanner: {
    marginHorizontal: 24,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  insightsDescription: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Regular',
  },
  insightsAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#0EA5E9',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
  },
  suggestionsContent: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 4,
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
  },
  suggestionDate: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  suggestionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  confidenceText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  customizeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customizeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0EA5E9',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  },
  groupsList:{
    paddingHorizontal:24,
    paddingBottom:24,
  },
  groupCard:{
    backgroundColor:'#FFFFFF',
    borderRadius:12,
    padding:16,
    marginBottom:12,
    shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:2,elevation:1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupIcon:{width:32,height:32,borderRadius:16,justifyContent:'center',alignItems:'center',marginRight:12},
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName:{fontSize:14,fontWeight:'600',color:'#111827',fontFamily:'Inter-SemiBold'},
  groupDescription:{fontSize:12,color:'#6B7280',fontFamily:'Inter-Regular',marginTop:2},
  groupMeta: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  groupBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  totalSpent: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  reasoningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  reasoningText: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 18,
  },
  groupOptionsContainer: {
    marginTop: 16,
    gap: 8,
  },
  groupOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  groupOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  groupOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  groupOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupOptionInfo: {
    flex: 1,
  },
  groupOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  groupOptionReasoning: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 6,
  },
  matchingFactors: {
    flexDirection: 'row',
    gap: 4,
  },
  factorChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  factorText: {
    fontSize: 10,
    color: '#1D4ED8',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  // Savings styles
  savingsContent: {
    flex: 1,
  },
  savingsGoalsList: {
    gap: 16,
  },
  savingsGoalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  goalHeader: {
    padding: 20,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  goalEmoji: {
    fontSize: 20,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  goalDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  goalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  goalBody: {
    padding: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  insightsSection: {
    marginBottom: 16,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 12,
    color: '#4B5563',
    fontFamily: 'Inter-Regular',
    marginBottom: 3,
    lineHeight: 16,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contributeButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contributeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Inter-SemiBold',
  },
  // Balance Overview
  balanceOverview: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  // Group Cards
  groupStats: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  groupSavings: {
    alignItems: 'flex-end',
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  savingsLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
}); 