import React, { useState } from 'react';
import { useSpendingAnalysis } from '../../hooks/usePlaid';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { TrendingUp, TrendingDown, DollarSign, Target, ChartBar as BarChart3, ChartPie as PieChart, Calendar, Filter } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const userId = '1'; // In production, get from auth context
  const { data: analyticsData, loading, error, refetch } = useSpendingAnalysis(userId, selectedPeriod);

  const analytics = analyticsData?.analysis;

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // The useAnalytics hook will automatically refetch when selectedPeriod changes
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Failed to load analytics'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Spending insights</Text>
          </View>
          <View style={styles.periodSelector}>
            {['1M', '3M', '6M', '1Y'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.selectedPeriodButton,
                ]}
                onPress={() => handlePeriodChange(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodButtonText,
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.primaryMetricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Net Cash Flow</Text>
              <View style={styles.metricTrend}>
                <TrendingUp size={14} color="#059669" />
                <Text style={styles.trendText}>{analytics.savingsRate}% savings rate</Text>
              </View>
            </View>
            <Text style={styles.primaryMetricValue}>${analytics.netCashFlow?.toFixed(2) || '0.00'}</Text>
          </View>

          <View style={styles.secondaryMetrics}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${analytics.totalSpent?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.metricLabel}>Total Spent</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{analytics.categories?.length || 0}</Text>
              <Text style={styles.metricLabel}>Categories</Text>
            </View>
          </View>
        </View>

        {/* Spending Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <View style={styles.categoriesCard}>
            {analytics.categories?.map((category: any, index: number) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryTrend}>
                      {category.transactions} transactions • {category.trend}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
                  <View style={styles.categoryPercentageContainer}>
                    <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
                    <View style={styles.categoryProgressBar}>
                      <View 
                        style={[
                          styles.categoryProgress, 
                          { 
                            width: `${category.percentage}%`,
                            backgroundColor: category.color || '#0EA5E9'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Trends Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Trends</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {analytics.monthlyTrends?.map((trend: any, index: number) => {
                const maxAmount = Math.max(...analytics.monthlyTrends.map((t: any) => t.spending));
                const height = (trend.spending / maxAmount) * 120;
                const isPositiveGrowth = trend.savings > 0;
                
                return (
                  <TouchableOpacity key={index} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <Text style={[
                        styles.growthIndicator,
                        { color: isPositiveGrowth ? '#059669' : '#DC2626' }
                      ]}>
                        ${(trend.savings / 1000).toFixed(1)}k
                      </Text>
                      <View
                        style={[
                          styles.bar, 
                          { 
                            height,
                            backgroundColor: isPositiveGrowth ? '#059669' : '#DC2626'
                          }
                        ]}
                      />
                      <Text style={styles.barAmount}>${(trend.spending / 1000).toFixed(1)}k</Text>
                    </View>
                    <Text style={styles.barLabel}>{trend.month}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Insights Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <View style={styles.insightsGrid}>
            {analytics.insights?.map((insight: any, index: number) => (
              <View key={index} style={styles.insightCard}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={[
                  styles.insightValue,
                  { color: insight.impact === 'high' ? '#DC2626' : insight.impact === 'medium' ? '#D97706' : '#059669' }
                ]}>
                  {insight.amount ? `$${insight.amount}` : insight.description}
                </Text>
                <Text style={styles.insightDescription}>
                  {insight.suggestion}
                </Text>
              </View>
            ))}
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectedPeriodButton: {
    backgroundColor: '#0EA5E9',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  selectedPeriodButtonText: {
    color: '#FFFFFF',
  },
  metricsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  primaryMetricCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#059669',
    fontFamily: 'Inter-Medium',
  },
  primaryMetricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  secondaryMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  categoriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    gap: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  categoryPercentageContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  categoryProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 2,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  chartBarContainer: {
    alignItems: 'center',
    gap: 8,
  },
  growthIndicator: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  bar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 20,
  },
  barAmount: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  insightsGrid: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
});