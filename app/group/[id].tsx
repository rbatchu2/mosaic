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
  XCircle,
  PiggyBank,
  Target,
  AlertCircle,
  Lightbulb,
  Zap
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

  // Savings goals state
  interface SavingsGoal {
    id: string;
    groupId: string;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    category: 'vacation' | 'house' | 'emergency' | 'event' | 'other';
    participants: {
      userId: string;
      name: string;
      contributionTarget: number;
      contributedAmount: number;
    }[];
    aiInsights: {
      monthlyTarget: number;
      completionProbability: number;
      suggestions: string[];
    };
  }

  // Group forecast state
  interface GroupForecast {
    groupId: string;
    groupName: string;
    forecastPeriod: '1M' | '3M' | '6M' | '1Y';
    generatedAt: string;
    cashFlow: {
      projectedIncome: number;
      projectedExpenses: number;
      netFlow: number;
      confidence: number;
    };
    spendingForecast: {
      category: string;
      currentMonthly: number;
      projectedMonthly: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      confidence: number;
    }[];
    aiInsights: {
      riskFactors: string[];
      opportunities: string[];
      recommendations: string[];
      seasonalTrends: string[];
    };
    smartAlerts: {
      type: 'warning' | 'opportunity' | 'milestone';
      message: string;
      action: string;
    }[];
  }

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [forecast, setForecast] = useState<GroupForecast | null>(null);
  const [forecastPeriod, setForecastPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'balances' | 'splits' | 'savings' | 'forecasting'>('overview');

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

      // Fetch group savings goals
      const savingsRes = await fetch(`/api/groups/savings?groupId=${id}&userId=00000000-0000-0000-0000-000000000001`);
      const savingsData = await savingsRes.json();
      if (savingsData.success) {
        setSavingsGoals(savingsData.goals);
      }

      // Fetch group forecast
      const forecastRes = await fetch(`/api/groups/forecasting?groupId=${id}&period=${forecastPeriod}&userId=00000000-0000-0000-0000-000000000001`);
      const forecastData = await forecastRes.json();
      if (forecastData.success) {
        setForecast(forecastData.forecast);
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

      // Mock savings goals for this group
      setSavingsGoals([
        {
          id: 'goal_group_001',
          groupId: id as string,
          name: `${group?.name || 'Group'} Vacation Fund`,
          description: 'Shared savings for our next group adventure',
          targetAmount: 2400,
          currentAmount: 890,
          targetDate: '2024-08-15',
          category: 'vacation',
          participants: [
            { userId: '1', name: 'You', contributionTarget: 600, contributedAmount: 250 },
            { userId: '2', name: 'Sarah', contributionTarget: 600, contributedAmount: 280 },
            { userId: '3', name: 'Mike', contributionTarget: 600, contributedAmount: 180 },
            { userId: '4', name: 'Emma', contributionTarget: 600, contributedAmount: 180 }
          ],
          aiInsights: {
            monthlyTarget: 380,
            completionProbability: 0.75,
            suggestions: [
              'Set up auto-transfers of $95/week per person',
              'Track group dining expenses for budget optimization',
              'Consider shared investment account for better returns'
            ]
          }
        }
      ]);

      // Mock forecast for this group
      setForecast({
        groupId: id as string,
        groupName: group?.name || 'Group',
        forecastPeriod: forecastPeriod,
        generatedAt: new Date().toISOString(),
        cashFlow: {
          projectedIncome: 0,
          projectedExpenses: 1240,
          netFlow: -1240,
          confidence: 0.78
        },
        spendingForecast: [
          {
            category: 'dining',
            currentMonthly: 744,
            projectedMonthly: 780,
            trend: 'increasing',
            confidence: 0.82
          },
          {
            category: 'transport',
            currentMonthly: 372,
            projectedMonthly: 360,
            trend: 'decreasing',
            confidence: 0.75
          },
          {
            category: 'entertainment',
            currentMonthly: 124,
            projectedMonthly: 140,
            trend: 'increasing',
            confidence: 0.65
          }
        ],
        aiInsights: {
          riskFactors: [
            'Dining expenses trending upward by 5% this quarter',
            'Group size fluctuation affects per-person costs'
          ],
          opportunities: [
            'Bulk meal planning could save 15% on dining',
            'Group transportation bookings show cost efficiency'
          ],
          recommendations: [
            'Set monthly spending limit of $1,200 for better control',
            'Track group activities to optimize shared costs',
            'Consider group meal prep sessions'
          ],
          seasonalTrends: [
            'Summer months typically see 20% higher activity',
            'Holiday periods show increased entertainment spending'
          ]
        },
        smartAlerts: [
          {
            type: 'opportunity',
            message: 'Group spending efficiency is 87% - above average!',
            action: 'Consider increasing shared savings goals'
          }
        ]
      });
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
            { key: 'savings', label: 'Savings' },
            { key: 'transactions', label: 'Transactions' },
            { key: 'balances', label: 'Balances' },
            { key: 'splits', label: 'Splits' },
            { key: 'forecasting', label: 'Forecast' }
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

        {activeTab === 'savings' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Savings Goals</Text>
                <TouchableOpacity onPress={() => Alert.alert('Add Goal', 'Create new shared savings goal coming soon!')}>
                  <Plus size={16} color="#0EA5E9" />
                </TouchableOpacity>
              </View>
              
              {savingsGoals.length === 0 ? (
                <View style={styles.emptyState}>
                  <PiggyBank size={32} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>No Savings Goals Yet</Text>
                  <Text style={styles.emptyStateSubtext}>Create shared goals to save together</Text>
                </View>
              ) : (
                savingsGoals.map((goal) => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  const getCategoryIcon = (category: string) => {
                    switch (category) {
                      case 'vacation': return '🌎';
                      case 'house': return '🏡';
                      case 'emergency': return '🚨';
                      case 'event': return '🎉';
                      default: return '💰';
                    }
                  };

                  const categoryColor = '#0EA5E9'; // Always blue

                  return (
                    <View key={goal.id} style={styles.savingsGoalCard}>
                      {/* Goal Header */}
                      <View style={styles.goalHeader}>
                        <View style={styles.goalHeaderLeft}>
                          <Text style={styles.goalEmoji}>{getCategoryIcon(goal.category)}</Text>
                          <View style={styles.goalInfo}>
                            <Text style={styles.goalName}>{goal.name}</Text>
                            <Text style={styles.goalMeta}>
                              {goal.participants.length} people • {daysLeft > 0 ? `${daysLeft} days left` : 'Goal reached!'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.goalAmountSection}>
                          <Text style={styles.goalAmount}>
                            ${goal.currentAmount.toLocaleString()}
                          </Text>
                          <Text style={styles.goalTarget}>
                            of ${goal.targetAmount.toLocaleString()}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { width: `${progress}%`, backgroundColor: categoryColor }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {progress.toFixed(0)}% complete
                        </Text>
                      </View>

                      {/* AI Insights */}
                      <View style={styles.aiInsightsRow}>
                        <View style={styles.insightItem}>
                          <Text style={styles.insightValue}>
                            ${goal.aiInsights.monthlyTarget}/mo
                          </Text>
                          <Text style={styles.insightLabel}>needed</Text>
                        </View>
                        <View style={styles.insightItem}>
                          <Text style={[styles.insightValue, {
                            color: goal.aiInsights.completionProbability > 0.7 ? '#10B981' :
                                   goal.aiInsights.completionProbability > 0.4 ? '#F59E0B' : '#EF4444'
                          }]}>
                            {Math.round(goal.aiInsights.completionProbability * 100)}%
                          </Text>
                          <Text style={styles.insightLabel}>likely</Text>
                        </View>
                        <TouchableOpacity style={[styles.contributeBtn, { backgroundColor: categoryColor }]}>
                          <Text style={styles.contributeBtnText}>Contribute</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {activeTab === 'forecasting' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Budget Forecast</Text>
                <View style={styles.periodSelector}>
                  {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[styles.periodButton, forecastPeriod === period && styles.selectedPeriod]}
                      onPress={() => setForecastPeriod(period)}
                    >
                      <Text style={[styles.periodText, forecastPeriod === period && styles.selectedPeriodText]}>
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {!forecast ? (
                <View style={styles.emptyState}>
                  <TrendingUp size={32} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>Generating Forecast...</Text>
                  <Text style={styles.emptyStateSubtext}>AI analysis in progress</Text>
                </View>
              ) : (
                <>
                  {/* Cash Flow Overview */}
                  <View style={styles.forecastCard}>
                    <View style={styles.forecastHeader}>
                      <Text style={styles.forecastTitle}>Net Cash Flow ({forecastPeriod})</Text>
                      <Text style={styles.forecastAmount}>
                        ${forecast.cashFlow.netFlow.toLocaleString()}
                      </Text>
                      <Text style={styles.confidenceText}>
                        {Math.round(forecast.cashFlow.confidence * 100)}% confidence
                      </Text>
                    </View>
                  </View>

                  {/* Smart Alerts */}
                  {forecast.smartAlerts.length > 0 && (
                    <View style={styles.alertsSection}>
                      <Text style={styles.alertsTitle}>Smart Alerts</Text>
                      {forecast.smartAlerts.map((alert, index) => (
                        <View key={index} style={[styles.alertCard, {
                          backgroundColor: alert.type === 'warning' ? '#FEF2F2' : 
                                          alert.type === 'opportunity' ? '#F0FDF4' : '#FEF3C7'
                        }]}>
                          <View style={styles.alertHeader}>
                            {alert.type === 'warning' && <AlertCircle size={14} color="#DC2626" />}
                            {alert.type === 'opportunity' && <Lightbulb size={14} color="#16A34A" />}
                            {alert.type === 'milestone' && <Target size={14} color="#D97706" />}
                            <Text style={[styles.alertType, {
                              color: alert.type === 'warning' ? '#DC2626' : 
                                     alert.type === 'opportunity' ? '#16A34A' : '#D97706'
                            }]}>
                              {alert.type.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.alertMessage}>{alert.message}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Category Forecasts */}
                  <View style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>Category Forecasts</Text>
                    {forecast.spendingForecast.map((category, index) => (
                      <View key={index} style={styles.categoryCard}>
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryName}>{category.category}</Text>
                          <View style={styles.categoryTrend}>
                            {category.trend === 'increasing' && <TrendingUp size={12} color="#EF4444" />}
                            {category.trend === 'decreasing' && <ArrowDownRight size={12} color="#10B981" />}
                            {category.trend === 'stable' && <Receipt size={12} color="#6B7280" />}
                            <Text style={[styles.trendText, {
                              color: category.trend === 'increasing' ? '#EF4444' : 
                                     category.trend === 'decreasing' ? '#10B981' : '#6B7280'
                            }]}>
                              {category.trend}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.categoryAmounts}>
                          <View style={styles.amountItem}>
                            <Text style={styles.amountLabel}>Current</Text>
                            <Text style={styles.amountValue}>
                              ${category.currentMonthly}/mo
                            </Text>
                          </View>
                          <Text style={styles.amountArrow}>→</Text>
                          <View style={styles.amountItem}>
                            <Text style={styles.amountLabel}>Projected</Text>
                            <Text style={[styles.amountValue, {
                              color: category.projectedMonthly > category.currentMonthly ? '#EF4444' : '#10B981'
                            }]}>
                              ${category.projectedMonthly}/mo
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* AI Insights */}
                  <View style={styles.aiInsightsSection}>
                    <Text style={styles.aiInsightsTitle}>AI Insights</Text>
                    
                    <View style={styles.insightCard}>
                      <View style={styles.insightHeader}>
                        <Lightbulb size={16} color="#F59E0B" />
                        <Text style={styles.insightTitle}>Recommendations</Text>
                      </View>
                      {forecast.aiInsights.recommendations.map((rec, index) => (
                        <Text key={index} style={styles.insightText}>• {rec}</Text>
                      ))}
                    </View>

                    <View style={styles.insightCard}>
                      <View style={styles.insightHeader}>
                        <AlertCircle size={16} color="#EF4444" />
                        <Text style={styles.insightTitle}>Risk Factors</Text>
                      </View>
                      {forecast.aiInsights.riskFactors.map((risk, index) => (
                        <Text key={index} style={styles.insightText}>• {risk}</Text>
                      ))}
                    </View>
                  </View>

                  <View style={styles.timestampContainer}>
                    <Clock size={12} color="#9CA3AF" />
                    <Text style={styles.timestampText}>
                      Generated {new Date(forecast.generatedAt).toLocaleString()}
                    </Text>
                  </View>
                </>
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
  // Savings styles
  savingsGoalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  goalMeta: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  goalAmountSection: {
    alignItems: 'flex-end',
  },
  goalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  goalTarget: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  aiInsightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightItem: {
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  insightLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  contributeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
      contributeBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: 'Inter-SemiBold',
    },
    // Savings Summary Styles
    savingsSummary: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    savingsSummaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    savingsSummaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
      fontFamily: 'Inter-SemiBold',
    },
    savingsOverview: {
      gap: 12,
    },
    savingsPreviewCard: {
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: '#0EA5E9',
    },
    savingsPreviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    savingsPreviewEmoji: {
      fontSize: 16,
      marginRight: 8,
    },
    savingsPreviewInfo: {
      flex: 1,
    },
    savingsPreviewName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1F2937',
      fontFamily: 'Inter-SemiBold',
      marginBottom: 2,
    },
    savingsPreviewAmount: {
      fontSize: 12,
      color: '#6B7280',
      fontFamily: 'Inter-Regular',
    },
    savingsPreviewProgress: {
      fontSize: 14,
      fontWeight: '600',
      color: '#0EA5E9',
      fontFamily: 'Inter-SemiBold',
    },
    savingsPreviewBar: {
      height: 4,
      backgroundColor: '#E5E7EB',
      borderRadius: 2,
      overflow: 'hidden',
    },
    savingsPreviewFill: {
      height: '100%',
      backgroundColor: '#0EA5E9',
      borderRadius: 2,
    },
  insightText: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Inter-Regular',
    marginBottom: 6,
    lineHeight: 20,
  },
  // Forecasting styles
  periodSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  periodButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  selectedPeriod: {
    backgroundColor: '#0EA5E9',
  },
  periodText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  forecastHeader: {
    alignItems: 'center',
  },
  forecastTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  forecastAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 11,
    color: '#0EA5E9',
    fontFamily: 'Inter-Medium',
  },
  alertsSection: {
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 10,
  },
  alertCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0EA5E9',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertType: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 10,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  categoryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  categoryAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  amountArrow: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },
  aiInsightsSection: {
    marginBottom: 16,
  },
  aiInsightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 10,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginVertical: 16,
  },
  timestampText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
}); 