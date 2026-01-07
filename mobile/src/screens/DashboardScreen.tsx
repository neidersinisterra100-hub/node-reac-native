import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import { Text, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { colors } from '../theme/colors';
import { MetricCard } from '../components/dashboard/MetricCard';
import { BarChart, LineChart, ProgressChart } from 'react-native-chart-kit';
import { api } from '../services/api';

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    earnings: 628,
    share: 2434,
    likes: 1259,
    rating: 8.5
  });

  useEffect(() => {
    // Aquí cargaríamos datos reales
    // const fetchData = async () => { ... }
    setLoading(false);
  }, []);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(26, 34, 54, ${opacity})`, // Navy
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => colors.dashboard.navy, // Navy
      },
      {
        data: [10, 30, 20, 60, 80, 30],
        color: (opacity = 1) => colors.dashboard.orange, // Orange
      }
    ]
  };

  const lineData = {
    labels: ["", "", "", "", "", ""], // Hide labels for clean look like design
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => colors.dashboard.orange, 
        strokeWidth: 2 
      },
      {
        data: [10, 20, 15, 40, 50, 25],
        color: (opacity = 1) => colors.dashboard.navy,
        strokeWidth: 2
      }
    ],
  };

  const donutData = {
    labels: ["Completed"], 
    data: [0.45]
  };

  return (
    <View style={styles.container}>
      {/* Sidebar-like Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <View style={styles.userInfo}>
                <Avatar.Text size={40} label="JD" style={{ backgroundColor: 'white' }} color={colors.dashboard.navy} />
                <View style={{ marginLeft: 12 }}>
                    <Text style={styles.userName}>JOHN DON</Text>
                    <Text style={styles.userEmail}>Johndon@company.com</Text>
                </View>
            </View>
            <View style={styles.headerIcons}>
                {/* Icons placeholder */}
            </View>
        </View>
        <Text style={styles.pageTitle}>Dashboard User</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Metrics Grid */}
        <View style={styles.grid}>
            <View style={styles.col}>
                <MetricCard title="Earning" value={`$ ${stats.earnings}`} icon="currency-usd" iconBackgroundColor={colors.dashboard.navy} iconColor="white" />
                <MetricCard title="Likes" value={`${stats.likes}`} icon="thumb-up" />
            </View>
            <View style={styles.col}>
                <MetricCard title="Share" value={`${stats.share}`} icon="share-variant" />
                <MetricCard title="Rating" value={`${stats.rating}`} icon="star" />
            </View>
        </View>

        {/* Bar Chart Section */}
        <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Result</Text>
                <Button mode="contained" buttonColor={colors.dashboard.orange} compact labelStyle={{ fontSize: 10 }}>Check Now</Button>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                    data={barData}
                    width={screenWidth} // + 40 to scroll
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    fromZero
                    showValuesOnTopOfBars={false}
                    withInnerLines={true}
                />
            </ScrollView>
        </View>

        {/* Area Chart Section */}
        <View style={styles.chartCard}>
             <View style={styles.chartHeader}>
                <View style={{flexDirection: 'row', gap: 8}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={[styles.dot, {backgroundColor: colors.dashboard.orange}]}/><Text style={styles.legend}>Lorem</Text></View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={[styles.dot, {backgroundColor: colors.dashboard.navy}]}/><Text style={styles.legend}>Ipsum</Text></View>
                </View>
            </View>
            <LineChart
                data={lineData}
                width={width - 48}
                height={180}
                chartConfig={{
                    ...chartConfig,
                    fillShadowGradientFrom: colors.dashboard.orange,
                    fillShadowGradientTo: colors.dashboard.orange,
                    fillShadowGradientFromOpacity: 0.3,
                    fillShadowGradientToOpacity: 0.1,
                    color: (opacity = 1) => colors.dashboard.orange,
                    strokeWidth: 0,
                    propsForDots: { r: "0" },
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                }}
                bezier
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLabels={false}
                withHorizontalLabels={false}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>

         {/* Donut Section */}
         <View style={[styles.chartCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }]}>
            <ProgressChart
                data={donutData}
                width={150}
                height={150}
                strokeWidth={16}
                radius={32}
                chartConfig={{
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    color: (opacity = 1) => colors.dashboard.navy,
                }}
                hideLegend={true}
            />
            <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.dashboard.navy }}>45%</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Lorem ipsum</Text>
                <Button mode="contained" buttonColor={colors.dashboard.orange} compact style={{ marginTop: 8 }} labelStyle={{ fontSize: 10 }}>Check Now</Button>
            </View>
         </View>
         
         <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.dashboard.navy,
    paddingTop: 50, // Safe Area approx
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  pageTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '300',
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  legend: {
      fontSize: 10,
      color: colors.textSecondary,
  },
  dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
  }
});
