import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  Target,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react-native';
import { useAnalytics } from '../../hooks/useApi';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const { data: analyticsData, loading, error } = useAnalytics(selectedPeriod);
  
  const analytics = (analyticsData as any)?.analytics;
  
  const periods = [
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: '6M', label: '6M' },
    { key: '1Y', label: '1Y' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <BarChart3 size={32} color="#0EA5E9" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={32} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load analytics</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Your financial insights</Text>
        </View>
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <DollarSign size={20} color="#EF4444" />
                <Text style={styles.metricLabel}>Total Spent</Text>
              </View>
              <Text style={styles.metricValue}>
                ${analytics.totalSpent?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              </Text>
              <View style={styles.metricTrend}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.metricTrendText}>+{analytics.monthlyGrowth || 0}%</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Target size={20} color="#10B981" />
                <Text style={styles.metricLabel}>Total Saved</Text>
              </View>
              <Text style={styles.metricValue}>
                ${analytics.totalSaved?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
              </Text>
              <View style={styles.metricTrend}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.metricTrendText}>{analytics.savingsRate || 0}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Savings Rate */}
        <View style={styles.section}>
          <View style={styles.savingsCard}>
            <View style={styles.savingsHeader}>
              <Text style={styles.savingsTitle}>Savings Rate</Text>
              <Text style={styles.savingsPercentage}>{analytics.savingsRate || 0}%</Text>
            </View>
            <View style={styles.savingsBar}>
              <View 
                style={[
                  styles.savingsProgress, 
                  { width: `${Math.min(analytics.savingsRate || 0, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.savingsText}>
              You're saving {analytics.savingsRate || 0}% of your income. Great work!
            </Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={styles.categoriesContainer}>
            {analytics.categories?.map((category: any, index: number) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryTrend}>{category.trend}</Text>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>
                    ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.categoryPercentage}>{category.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Trends</Text>
          <View style={styles.trendsContainer}>
            {analytics.monthlyTrends?.map((trend: any, index: number) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendMonth}>{trend.month}</Text>
                <View style={styles.trendBar}>
                  <View 
                    style={[
                      styles.trendProgress,
                      { 
                        height: `${(trend.amount / Math.max(...analytics.monthlyTrends.map((t: any) => t.amount))) * 100}%`,
                        backgroundColor: trend.growth >= 0 ? '#10B981' : '#EF4444'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.trendAmount}>${(trend.amount / 1000).toFixed(1)}k</Text>
                <View style={styles.trendGrowth}>
                  {trend.growth >= 0 ? (
                    <ArrowUpRight size={10} color="#10B981" />
                  ) : (
                    <ArrowDownRight size={10} color="#EF4444" />
                  )}
                  <Text style={[
                    styles.trendGrowthText,
                    { color: trend.growth >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {Math.abs(trend.growth)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightsContainer}>
            {analytics.insights?.map((insight: any, index: number) => (
              <View key={index} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View style={[
                    styles.insightIcon,
                    { backgroundColor: insight.type === 'positive' ? '#D1FAE5' : insight.type === 'warning' ? '#FEF3C7' : '#FEE2E2' }
                  ]}>
                    {insight.type === 'positive' ? (
                      <TrendingUp size={16} color="#10B981" />
                    ) : insight.type === 'warning' ? (
                      <AlertCircle size={16} color="#F59E0B" />
                    ) : (
                      <TrendingDown size={16} color="#EF4444" />
                    )}
                  </View>
                  <View style={styles.insightInfo}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={[
                      styles.insightValue,
                      { color: insight.type === 'positive' ? '#10B981' : insight.type === 'warning' ? '#F59E0B' : '#EF4444' }
                    ]}>
                      {insight.value}
                    </Text>
                  </View>
                </View>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  periodButtonTextActive: {
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 20,
    fontFamily: 'Inter-SemiBold',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricTrendText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'Inter-Medium',
  },
  savingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  savingsPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
  },
  savingsBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 12,
  },
  savingsProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  savingsText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
  },
  categoryTrend: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  trendsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendMonth: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  trendBar: {
    width: 24,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  trendProgress: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },
  trendAmount: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  trendGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendGrowthText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Inter-Bold',
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  bottomPadding: {
    height: 20,
  },
}); 