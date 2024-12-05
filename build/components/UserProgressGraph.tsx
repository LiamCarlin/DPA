import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface UserProgressGraphProps {
  data: {
    date: string;
    amount: number;
  }[];
  username: string;
}

const UserProgressGraph: React.FC<UserProgressGraphProps> = ({ data, username }) => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate cumulative amounts
  let cumulativeAmount = 0;
  const chartData = sortedData.map(entry => {
    cumulativeAmount += entry.amount;
    return cumulativeAmount;
  });

  // Get dates for labels (show last 6 dates)
  const dates = sortedData.map(entry => {
    const date = new Date(entry.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const displayDates = dates.slice(-6);
  const displayData = chartData.slice(-6);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{username}'s Progress</Text>
      {data.length > 0 ? (
        <LineChart
          data={{
            labels: displayDates,
            datasets: [
              {
                data: displayData.length > 0 ? displayData : [0],
              },
            ],
          }}
          width={Dimensions.get('window').width - 60}
          height={180}
          chartConfig={{
            backgroundColor: '#1E293B',
            backgroundGradientFrom: '#1E293B',
            backgroundGradientTo: '#1E293B',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#4ADE80',
            },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#888',
    fontSize: 16,
  },
});

export default UserProgressGraph; 