import React, { useState } from 'react';
import { usePlaidAccounts, usePlaidTransactions, useSpendingAnalysis } from '../../hooks/usePlaid';
import { plaidService } from '../../services/plaidService';
import { formatRelativeTime } from '../../utils/dateUtils';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Plus, TrendingUp, CreditCard, DollarSign, ArrowUpRight, MessageCircle, Target, Calendar, Link, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const userId = '1'; // In production, get from auth context
  const { data: accountsData, loading: accountsLoading, error: accountsError } = usePlaidAccounts(userId);
  const { data: transactionsData, loading: transactionsLoading } = usePlaidTransactions(userId, undefined, 5);
  const { data: analysisData } = useSpendingAnalysis(userId);

  const accounts = accountsData?.accounts || [];
  const recentTransactions = transactionsData?.transactions || [];
  const analysis = analysisData?.analysis;
  const totalBalance = accounts.reduce((sum: number, account: any) => sum + (account.balance || 0), 0);

  const handleChatPress = () => {
    router.push('/chat');
  };

  const handleConnectBank = async () => {
    try {
      const linkTokenResponse = await plaidService.createLinkToken(userId);
      if (linkTokenResponse.success) {
        // In production, open Plaid Link modal
        Alert.alert(
          'Connect Bank Account',
          'In production, this would open Plaid Link to securely connect your bank account.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to create link token:', error);
    }
  };

  if (accountsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (accountsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {accountsError}</Text>
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
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>Alex</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
              <MessageCircle size={20} color="#0EA5E9" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileContainer}>
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=150',
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Overview */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
          <View style={styles.balanceSubtext}>
            <View style={styles.growthIndicator}>
              <TrendingUp size={14} color="#059669" />
              <Text style={styles.balanceGrowth}>
                {analysis ? `${analysis.savingsRate}% savings rate` : '+12.5% this month'}
              </Text>
            </View>
          </View>
        </View>

        {/* Connected Accounts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Accounts</Text>
            <TouchableOpacity style={styles.addWalletButton} onPress={handleConnectBank}>
              <Link size={16} color="#0EA5E9" />
              <Text style={styles.addWalletText}>Connect</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.accountsContainer}
            contentContainerStyle={styles.accountsContent}
          >
            {accounts.length === 0 ? (
              <TouchableOpacity style={styles.connectCard} onPress={handleConnectBank}>
                <View style={styles.connectIcon}>
                  <Link size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.connectTitle}>Connect Your Bank</Text>
                <Text style={styles.connectDescription}>
                  Securely link your bank account to automatically track and categorize your spending
                </Text>
                <View style={styles.connectButton}>
                  <Text style={styles.connectButtonText}>Get Started</Text>
                </View>
              </TouchableOpacity>
            ) : (
              accounts.map((account: any) => (
                <TouchableOpacity key={account.id} style={styles.accountCard}>
                  <View style={styles.accountHeader}>
                    <View style={styles.accountType}>
                      <Text style={styles.accountTypeText}>{account.subtype}</Text>
                    </View>
                    <View style={styles.accountInstitution}>
                      <CreditCard size={12} color="#6B7280" />
                      <Text style={styles.accountInstitutionText}>•••• {account.mask}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountBalance}>
                    ${Math.abs(account.balance).toFixed(2)}
                  </Text>
                  <Text style={styles.accountInstitutionName}>{account.institution}</Text>
                  
                  <View style={styles.accountFooter}>
                    <View style={styles.syncStatus}>
                      <Zap size={10} color="#10B981" />
                      <Text style={styles.syncText}>Real-time sync</Text>
                    </View>
                    <Text style={styles.accountActivity}>
                      Last updated: Just now
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Spending Categories */}
        {analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending This Month</Text>
            <View style={styles.categoriesCard}>
              {analysis.categories.slice(0, 3).map((category: any, index: number) => (
                <View key={index} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryTrend}>
                        {category.transactions} transactions • {category.trend}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
                    <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Insights */}
        {analysis?.insights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.insightsContainer}
            >
              {analysis.insights.map((insight: any, index: number) => (
                <View key={index} style={styles.insightCard}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                  <Text style={styles.insightSuggestion}>{insight.suggestion}</Text>
                  {insight.amount && (
                    <Text style={styles.insightAmount}>Save ${insight.amount}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleConnectBank}>
              <View style={styles.actionIcon}>
                <Link size={18} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>Connect Bank</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <DollarSign size={18} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>Split Bill</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Target size={18} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowUpRight size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentTransactions.map((transaction: any) => (
              <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.amount < 0 ? '#FEF2F2' : '#F0FDF4' }
                  ]}>
                    {transaction.amount < 0 ? (
                      <ArrowUpRight size={14} color="#DC2626" />
                    ) : (
                      <Plus size={14} color="#059669" />
                    )}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {transaction.merchantName || transaction.description}
                    </Text>
                    <Text style={styles.transactionCategory}>
                      {transaction.category?.[0]} • {formatRelativeTime(transaction.date)}
                    </Text>
                    {transaction.suggestedSplit && (
                      <Text style={styles.splitSuggestion}>
                        💡 Can be split with {transaction.suggestedSplit.participants.length} people
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.amount < 0 ? '#DC2626' : '#059669' }
                  ]}>
                    {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  {transaction.confidence && (
                    <Text style={styles.confidenceScore}>
                      {Math.round(transaction.confidence * 100)}% confident
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Monthly Summary */}
        {analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>${analysis.totalIncome?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.statLabel}>Income</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>-${analysis.totalSpent?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>${analysis.netCashFlow?.toFixed(2) || '0.00'}</Text>
                <Text style={styles.statLabel}>Net Flow</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileContainer: {
    marginLeft: 4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  balanceSubtext: {
    gap: 8,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceGrowth: {
    fontSize: 14,
    color: '#059669',
    fontFamily: 'Inter-Medium',
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  addWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addWalletText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  accountsContainer: {
    marginHorizontal: -24,
  },
  accountsContent: {
    paddingHorizontal: 24,
  },
  connectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  connectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  connectDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    width: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountType: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accountTypeText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  accountInstitution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accountInstitutionText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  accountBalance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  accountInstitutionName: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  accountFooter: {
    gap: 8,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'Inter-Medium',
  },
  accountActivity: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  categoriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  categoryTrend: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  insightsContainer: {
    marginHorizontal: -24,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
  },
  insightDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    marginBottom: 8,
  },
  insightSuggestion: {
    fontSize: 12,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
    lineHeight: 16,
    marginBottom: 8,
  },
  insightAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  splitSuggestion: {
    fontSize: 11,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  confidenceScore: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});