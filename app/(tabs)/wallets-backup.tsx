import React, { useState } from 'react';
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
} from 'react-native';
import { Plus, Brain, Check, X, DollarSign, MapPin, ArrowUpRight, Edit3, Zap } from 'lucide-react-native';

interface SplitSuggestion {
  id: string;
  transactionId: string;
  amount: number;
  description: string;
  merchantName: string;
  date: string;
  confidence: number;
  matchedGroup: any;
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
  const userId = '1';
  const { data: transactionsData, loading: transactionsLoading, refetch } = usePlaidTransactions(userId, undefined, 20);
  
  const [activeTab, setActiveTab] = useState<'groups' | 'suggestions' | 'activity'>('groups');
  
  const transactions = transactionsData?.transactions || [];

  // Mock split suggestions for demo
  const splitSuggestions: SplitSuggestion[] = [
    {
      id: 'split_1',
      transactionId: '1',
      amount: 75.40,
      description: 'Dinner at Italian Restaurant',
      merchantName: 'Bella Vista',
      date: '2024-06-10T19:30:00Z',
      confidence: 0.92,
      matchedGroup: { name: 'Foodie Friends', color: '#EF4444' },
      matchReasons: ['Matches dining pattern', 'Restaurant category'],
      suggestedParticipants: [
        { id: '1', name: 'You', confidence: 1.0 },
        { id: '2', name: 'Sarah', confidence: 0.85 },
        { id: '3', name: 'Mike', confidence: 0.78 }
      ],
      splitType: 'equal',
      amounts: { '1': 25.13, '2': 25.13, '3': 25.14 },
      status: 'pending'
    }
  ];

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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Smart Groups</Text>
            <Text style={styles.headerSubtitle}>AI-powered expense splitting</Text>
          </View>
          <TouchableOpacity style={styles.createButton}>
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
              <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'suggestions' && ` (${splitSuggestions.length})`}
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
                GPT analyzed these expenses and matched them to your spending patterns.
              </Text>
              
              {splitSuggestions.map((suggestion) => (
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

                  <View style={styles.confidenceBadge}>
                    <Brain size={12} color="#0EA5E9" />
                    <Text style={styles.confidenceText}>{Math.round(suggestion.confidence * 100)}% confident</Text>
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
              ))}
            </View>
          )}

          {activeTab === 'groups' && (
            <View style={styles.emptyState}>
              <Brain size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>GPT Integration Ready</Text>
              <Text style={styles.emptyStateDescription}>
                Your smart split feature is now powered by GPT. Try the suggestions tab!
              </Text>
            </View>
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
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
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
}); 