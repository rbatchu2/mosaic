import React, { useState, useEffect } from 'react';
import { usePlaidTransactions, useSpendingAnalysis } from '../../hooks/usePlaid';
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
} from 'react-native';
import { Plus, Brain, Check, X, DollarSign, MapPin, ArrowUpRight, Edit3, Zap, Users, Utensils, Car, Home, Film, Plane, Tag } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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

export default function WalletsScreen() {
  const router = useRouter();
  const userId = '1';

  // Plaid transactions for Suggestions & Activity tabs
  const { data: transactionsData, loading: transactionsLoading, refetch } =
    usePlaidTransactions(userId, undefined, 20);

  // Groups state
  interface Group {
    id: string;
    name: string;
    description: string;
    category: string;
    color: string;
    memberCount: number;
  }

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

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups?userId=00000000-0000-0000-0000-000000000001');
        const data = await res.json();
        if (data.success) {
          setGroups(data.groups);
        }
      } catch (err) {
        console.error('Fetch groups error:', err);
      } finally {
        setGroupsLoading(false);
      }
    };
    fetchGroups();
  }, []);
  
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
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/groups')}
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
            <Text style={styles.insightsTitle}>GPT Integration Active</Text>
            <Text style={styles.insightsDescription}>
              AI-powered smart split suggestions are now available
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
                          <Text style={[styles.groupMeta, { color: meta.color }]}> {meta.label} • {group.memberCount} members</Text>
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
  groupHeader:{flexDirection:'row',alignItems:'center'},
  groupIcon:{width:32,height:32,borderRadius:16,justifyContent:'center',alignItems:'center',marginRight:12},
  groupInfo:{flex:1},
  groupName:{fontSize:14,fontWeight:'600',color:'#111827',fontFamily:'Inter-SemiBold'},
  groupDescription:{fontSize:12,color:'#6B7280',fontFamily:'Inter-Regular',marginTop:2},
  groupMeta:{fontSize:11,fontFamily:'Inter-Medium',marginTop:2},
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
}); 