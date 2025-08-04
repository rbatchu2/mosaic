import React, { useState, useEffect } from 'react';
import { formatRelativeTime } from '../../utils/dateUtils';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Plus, TrendingUp, Users, DollarSign, ArrowUpRight, MessageCircle, PiggyBank, Bell, Target, Brain, Receipt, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Group {
  id: string;
  name: string;
  balance: number;
}

interface Activity {
  id: string;
  type: string;
  groupName: string;
  description: string;
  amount: number;
  date: Date;
  paidBy?: string;
  participants?: number;
}

interface PendingRequest {
  id: string;
  groupName: string;
  description: string;
  amount: number;
  from: string;
  dueDate: Date;
}



export default function HomeScreen() {
  const router = useRouter();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGroups([
        { id: 'group_001', name: 'Foodie Friends', balance: 127.45 },
        { id: 'group_002', name: 'House Squad', balance: -85.60 },
        { id: 'group_003', name: 'SFO to Moab Trip', balance: 156.30 },
        { id: 'group_004', name: 'Road Trip Crew', balance: 234.75 },
        { id: 'group_005', name: 'Weekend Warriors', balance: -43.20 }
      ]);

      setRecentActivity([
        {
          id: 'act_001',
          type: 'expense',
          groupName: 'Foodie Friends',
          description: 'Dinner at The French Laundry',
          amount: 348.50,
          paidBy: 'Sarah',
          date: new Date('2024-01-22T19:30:00'),
          participants: 4
        },
        {
          id: 'act_002', 
          type: 'payment',
          groupName: 'House Squad',
          description: 'You paid Mike',
          amount: 125.00,
          date: new Date('2024-01-22T14:15:00')
        },
        {
          id: 'act_003',
          type: 'savings',
          groupName: 'SFO to Moab Trip',
          description: 'Alex contributed to trip fund',
          amount: 200.00,
          date: new Date('2024-01-21T10:30:00')
        }
      ]);

      setPendingRequests([
        {
          id: 'req_001',
          groupName: 'Weekend Warriors',
          description: 'Concert tickets',
          amount: 85.50,
          from: 'Jessica',
          dueDate: new Date('2024-01-25')
        },
        {
          id: 'req_002',
          groupName: 'House Squad', 
          description: 'Grocery run',
          amount: 67.20,
          from: 'Mike',
          dueDate: new Date('2024-01-24')
        }
      ]);



      setLoading(false);
    }, 1000);
  }, []);

  const totalOwed = groups.reduce((sum, group) => sum + Math.max(group.balance, 0), 0);
  const totalOwing = groups.reduce((sum, group) => sum + Math.abs(Math.min(group.balance, 0)), 0);
  const netBalance = totalOwed - totalOwing;


  const handleChatPress = () => {
    router.push('/chat');
  };

  const handleAddExpense = () => {
    Alert.alert('Add Expense', 'Choose a group to add expense to...');
  };

  const handleRequestMoney = () => {
    Alert.alert('Request Money', 'Send a split request to group members...');
  };

  const handlePayRequest = (request: PendingRequest) => {
    Alert.alert('Payment', `Pay $${request.amount.toFixed(2)} to ${request.from}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay Now', onPress: () => {
        Alert.alert('Success', 'Payment sent!');
      }}
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your groups...</Text>
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
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={20} color="#0EA5E9" />
              {pendingRequests.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>{pendingRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
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

        {/* Group Balance Overview */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Group Balance</Text>
          <Text style={[styles.balanceAmount, { 
            color: netBalance >= 0 ? '#10B981' : '#EF4444' 
          }]}>
            {netBalance >= 0 ? '+' : ''}${netBalance.toFixed(2)}
          </Text>
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemValue}>+${totalOwed.toFixed(2)}</Text>
              <Text style={styles.balanceItemLabel}>owed to you</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemValue}>-${totalOwing.toFixed(2)}</Text>
              <Text style={styles.balanceItemLabel}>you owe</Text>
            </View>
          </View>
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              <Text style={styles.requestCount}>{pendingRequests.length} pending</Text>
            </View>
            
            <View style={styles.requestsList}>
              {pendingRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestLeft}>
                    <View style={styles.requestIcon}>
                      <Clock size={16} color="#F59E0B" />
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestDescription}>{request.description}</Text>
                      <Text style={styles.requestGroup}>{request.groupName} • From {request.from}</Text>
                      <Text style={styles.requestDue}>
                        Due {formatRelativeTime(request.dueDate.toISOString())}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestRight}>
                    <Text style={styles.requestAmount}>${request.amount.toFixed(2)}</Text>
                    <TouchableOpacity 
                      style={styles.payButton}
                      onPress={() => handlePayRequest(request)}
                    >
                      <Text style={styles.payButtonText}>Pay</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}



        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleAddExpense}>
              <View style={styles.actionIcon}>
                <Plus size={18} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleRequestMoney}>
              <View style={styles.actionIcon}>
                <DollarSign size={18} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>Request Split</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/wallets')}>
              <View style={styles.actionIcon}>
                <Users size={18} color="#0EA5E9" />
              </View>
              <Text style={styles.actionText}>View Groups</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowUpRight size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View style={[
                    styles.activityIcon,
                    { backgroundColor: activity.type === 'expense' ? '#FEF2F2' : 
                                     activity.type === 'payment' ? '#F0FDF4' : '#FEF3C7' }
                  ]}>
                    {activity.type === 'expense' ? (
                      <Receipt size={14} color="#DC2626" />
                    ) : activity.type === 'payment' ? (
                      <ArrowUpRight size={14} color="#059669" />
                    ) : (
                      <PiggyBank size={14} color="#F59E0B" />
                    )}
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                                         <Text style={styles.activityGroup}>
                       {activity.groupName} • {formatRelativeTime(activity.date.toISOString())}
                     </Text>
                    {activity.participants && (
                      <Text style={styles.activityParticipants}>
                        Split with {activity.participants} people
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text style={[
                    styles.activityAmount,
                    { color: activity.type === 'payment' ? '#DC2626' : '#059669' }
                  ]}>
                    {activity.type === 'payment' ? '-' : '+'}${activity.amount.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Brain size={16} color="#0EA5E9" />
              <Text style={styles.insightTitle}>Weekly Spending Pattern</Text>
            </View>
            <Text style={styles.insightDescription}>
              Your Foodie Friends group spends 40% more on weekends. Consider setting a weekend budget to track this better.
            </Text>
            <Text style={styles.insightSuggestion}>
              Try suggesting a weekly group budget of $200
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
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
  notificationButton: {
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
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
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
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceItemValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
  },
  balanceItemLabel: {
    fontSize: 13,
    color: '#6B7280',
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
  requestCount: {
    fontSize: 14,
    color: '#F59E0B',
    fontFamily: 'Inter-Medium',
  },
  requestsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  requestGroup: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  requestDue: {
    fontSize: 11,
    color: '#F59E0B',
    fontFamily: 'Inter-Medium',
  },
  requestRight: {
    alignItems: 'flex-end',
  },
  requestAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  payButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  goalsContainer: {
    marginHorizontal: -24,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  goalGroup: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  goalProgress: {
    marginBottom: 8,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 4,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  goalAmount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  activityGroup: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  activityParticipants: {
    fontSize: 11,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightSuggestion: {
    fontSize: 13,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
});