import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  RefreshControl,
  Alert 
} from 'react-native';
import { 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Receipt, 
  TrendingUp,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { formatRelativeTime } from '../../utils/dateUtils';

interface GroupTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: { id: string; name: string };
  category: string;
  participants: Array<{ id: string; name: string; amount: number }>;
  status: 'pending' | 'completed' | 'settled';
}

interface GroupBalance {
  userId: string;
  userName: string;
  balance: number; // positive = owed money, negative = owes money
  totalPaid: number;
  totalOwed: number;
}

interface SplitRequest {
  id: string;
  transactionId: string;
  description: string;
  amount: number;
  requestedBy: { id: string; name: string };
  status: 'pending' | 'accepted' | 'rejected';
  participants: Array<{ id: string; name: string; amount: number; status: string }>;
  createdAt: string;
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<GroupTransaction[]>([]);
  const [balances, setBalances] = useState<GroupBalance[]>([]);
  const [splitRequests, setSplitRequests] = useState<SplitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'balances' | 'splits'>('overview');

  const fetchGroupData = async () => {
    try {
      // Fetch group basic info
      const groupRes = await fetch(`/api/group/${id}`);
      const groupData = await groupRes.json();
      
      if (groupData.success) {
        setGroup(groupData.group);
        setMembers(groupData.members);
      }

      // Fetch group transactions
      const transactionsRes = await fetch(`/api/group/${id}/transactions`);
      const transactionsData = await transactionsRes.json();
      if (transactionsData.success) {
        setTransactions(transactionsData.transactions);
      }

      // Fetch group balances
      const balancesRes = await fetch(`/api/group/${id}/balances`);
      const balancesData = await balancesRes.json();
      if (balancesData.success) {
        setBalances(balancesData.balances);
      }

      // Fetch split requests
      const splitsRes = await fetch(`/api/group/${id}/splits`);
      const splitsData = await splitsRes.json();
      if (splitsData.success) {
        setSplitRequests(splitsData.splits);
      }

    } catch (err) {
      console.error('Fetch group data error', err);
      
      // Mock data fallback for demo
      setTransactions([
        {
          id: '1',
          description: 'Dinner at Italian Restaurant',
          amount: 156.80,
          date: '2024-01-15T19:30:00Z',
          paidBy: { id: '1', name: 'You' },
          category: 'dining',
          participants: [
            { id: '1', name: 'You', amount: 52.27 },
            { id: '2', name: 'Sarah', amount: 52.27 },
            { id: '3', name: 'Mike', amount: 52.26 }
          ],
          status: 'completed'
        },
        {
          id: '2',
          description: 'Uber ride to airport',
          amount: 45.60,
          date: '2024-01-12T08:15:00Z',
          paidBy: { id: '2', name: 'Sarah' },
          category: 'transport',
          participants: [
            { id: '1', name: 'You', amount: 22.80 },
            { id: '2', name: 'Sarah', amount: 22.80 }
          ],
          status: 'pending'
        },
        {
          id: '3',
          description: 'Grocery shopping',
          amount: 78.45,
          date: '2024-01-10T14:22:00Z',
          paidBy: { id: '3', name: 'Mike' },
          category: 'household',
          participants: [
            { id: '1', name: 'You', amount: 26.15 },
            { id: '2', name: 'Sarah', amount: 26.15 },
            { id: '3', name: 'Mike', amount: 26.15 }
          ],
          status: 'completed'
        }
      ]);

      setBalances([
        { userId: '1', userName: 'You', balance: 26.73, totalPaid: 156.80, totalOwed: 101.22 },
        { userId: '2', userName: 'Sarah', balance: -7.47, totalPaid: 45.60, totalOwed: 101.22 },
        { userId: '3', userName: 'Mike', balance: -19.26, totalPaid: 78.45, totalOwed: 78.41 }
      ]);

      setSplitRequests([
        {
          id: '1',
          transactionId: '2',
          description: 'Uber ride to airport',
          amount: 45.60,
          requestedBy: { id: '2', name: 'Sarah' },
          status: 'pending',
          participants: [
            { id: '1', name: 'You', amount: 22.80, status: 'pending' },
            { id: '2', name: 'Sarah', amount: 22.80, status: 'accepted' }
          ],
          createdAt: '2024-01-12T08:20:00Z'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroupData();
  };

  const getTotalGroupSpent = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getYourBalance = () => {
    const yourBalance = balances.find(b => b.userName === 'You');
    return yourBalance?.balance || 0;
  };

  const handleSplitAction = (splitId: string, action: 'accept' | 'reject') => {
    const actionText = action === 'accept' ? 'accepted' : 'rejected';
    Alert.alert('Split Request', `Split request ${actionText}!`);
    
    // Update split request status
    setSplitRequests(prev => 
      prev.map(split => 
        split.id === splitId 
          ? { ...split, status: action === 'accept' ? 'accepted' : 'rejected' }
          : split
      )
    );
  };

  const handleAddExpense = () => {
    Alert.alert('Add Expense', 'Feature coming soon! You can add new expenses to split with the group.');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading group details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Group not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: group.name,
        headerRight: () => (
          <TouchableOpacity onPress={handleAddExpense} style={styles.headerButton}>
            <Plus size={20} color="#0EA5E9" />
          </TouchableOpacity>
        )
      }} />
      
      <ScrollView 
        style={styles.scrollView} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Group Header */}
        <View style={styles.header}>
          <View style={[styles.groupIcon, { backgroundColor: group.color }]}> 
            <Users size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>{group.description}</Text>
          <Text style={styles.metaText}>{members.length} members • {group.category}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#10B981" />
            <Text style={styles.statValue}>${getTotalGroupSpent().toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={getYourBalance() >= 0 ? "#10B981" : "#EF4444"} />
            <Text style={[styles.statValue, { color: getYourBalance() >= 0 ? "#10B981" : "#EF4444" }]}>
              ${Math.abs(getYourBalance()).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>{getYourBalance() >= 0 ? 'Owed to You' : 'You Owe'}</Text>
          </View>
          <View style={styles.statCard}>
            <Receipt size={20} color="#6B7280" />
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'transactions', label: 'Transactions' },
            { key: 'balances', label: 'Balances' },
            { key: 'splits', label: 'Splits' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Recent Transactions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => setActiveTab('transactions')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {transactions.slice(0, 3).map(transaction => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <Receipt size={16} color="#6B7280" />
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>{transaction.description}</Text>
                      <Text style={styles.transactionMeta}>
                        Paid by {transaction.paidBy.name} • {formatRelativeTime(transaction.date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>${transaction.amount.toFixed(2)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: transaction.status === 'completed' ? '#D1FAE5' : '#FEF3C7' }]}>
                      <Text style={[styles.statusText, { color: transaction.status === 'completed' ? '#065F46' : '#92400E' }]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Members */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Members</Text>
              {members.map(member => {
                const balance = balances.find(b => b.userName === member.name);
                return (
                  <View key={member.id || member.email} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                    {balance && (
                      <View style={styles.memberBalance}>
                        <Text style={[
                          styles.balanceAmount,
                          { color: balance.balance >= 0 ? '#10B981' : '#EF4444' }
                        ]}>
                          {balance.balance >= 0 ? '+' : ''}${balance.balance.toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'transactions' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Transactions</Text>
              {transactions.map(transaction => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <Receipt size={16} color="#6B7280" />
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>{transaction.description}</Text>
                      <Text style={styles.transactionMeta}>
                        Paid by {transaction.paidBy.name} • {formatRelativeTime(transaction.date)}
                      </Text>
                      <Text style={styles.participantsText}>
                        Split between: {transaction.participants.map(p => p.name).join(', ')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>${transaction.amount.toFixed(2)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: transaction.status === 'completed' ? '#D1FAE5' : '#FEF3C7' }]}>
                      <Text style={[styles.statusText, { color: transaction.status === 'completed' ? '#065F46' : '#92400E' }]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'balances' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Group Balances</Text>
              {balances.map(balance => (
                <View key={balance.userId} style={styles.balanceCard}>
                  <View style={styles.balanceLeft}>
                    <Text style={styles.balanceName}>{balance.userName}</Text>
                    <Text style={styles.balanceDetails}>
                      Paid: ${balance.totalPaid.toFixed(2)} • Owes: ${balance.totalOwed.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.balanceRight}>
                    <Text style={[
                      styles.balanceAmount,
                      { color: balance.balance >= 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {balance.balance >= 0 ? '+' : ''}${balance.balance.toFixed(2)}
                    </Text>
                    <Text style={styles.balanceLabel}>
                      {balance.balance >= 0 ? 'Gets back' : 'Owes'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'splits' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Split Requests</Text>
              {splitRequests.filter(s => s.status === 'pending').map(split => (
                <View key={split.id} style={styles.splitCard}>
                  <View style={styles.splitHeader}>
                    <Text style={styles.splitDescription}>{split.description}</Text>
                    <Text style={styles.splitAmount}>${split.amount.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.splitMeta}>
                    Requested by {split.requestedBy.name} • {formatRelativeTime(split.createdAt)}
                  </Text>
                  <View style={styles.splitParticipants}>
                    {split.participants.map(participant => (
                      <View key={participant.id} style={styles.participantRow}>
                        <Text style={styles.participantName}>{participant.name}</Text>
                        <Text style={styles.participantAmount}>${participant.amount.toFixed(2)}</Text>
                        <View style={[
                          styles.participantStatus,
                          { backgroundColor: participant.status === 'accepted' ? '#D1FAE5' : '#FEF3C7' }
                        ]}>
                          <Text style={[
                            styles.participantStatusText,
                            { color: participant.status === 'accepted' ? '#065F46' : '#92400E' }
                          ]}>
                            {participant.status}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  {split.participants.some(p => p.name === 'You' && p.status === 'pending') && (
                    <View style={styles.splitActions}>
                      <TouchableOpacity 
                        style={[styles.splitButton, styles.acceptButton]}
                        onPress={() => handleSplitAction(split.id, 'accept')}
                      >
                        <CheckCircle size={16} color="#FFFFFF" />
                        <Text style={styles.splitButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.splitButton, styles.rejectButton]}
                        onPress={() => handleSplitAction(split.id, 'reject')}
                      >
                        <XCircle size={16} color="#FFFFFF" />
                        <Text style={styles.splitButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
              
              {splitRequests.filter(s => s.status === 'pending').length === 0 && (
                <View style={styles.emptyState}>
                  <CheckCircle size={32} color="#10B981" />
                  <Text style={styles.emptyStateText}>All caught up!</Text>
                  <Text style={styles.emptyStateSubtext}>No pending split requests</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    fontSize: 16, 
    color: '#6B7280',
    fontFamily: 'Inter-Medium'
  },
  headerButton: {
    padding: 4,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  groupIcon: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  groupName: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1F2937', 
    fontFamily: 'Inter-Bold', 
    marginBottom: 8 
  },
  groupDescription: { 
    fontSize: 14, 
    color: '#6B7280', 
    fontFamily: 'Inter-Regular', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  metaText: { 
    fontSize: 12, 
    color: '#9CA3AF', 
    fontFamily: 'Inter-Regular'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0EA5E9',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  transactionMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  participantsText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  memberBalance: {
    alignItems: 'flex-end',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceLeft: {
    flex: 1,
  },
  balanceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  balanceDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  balanceRight: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  splitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  splitDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  splitMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  splitParticipants: {
    marginBottom: 16,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  participantName: {
    fontSize: 13,
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  participantAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    marginRight: 12,
  },
  participantStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  participantStatusText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  splitActions: {
    flexDirection: 'row',
    gap: 12,
  },
  splitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  splitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  bottomPadding: {
    height: 20,
  },
}); 