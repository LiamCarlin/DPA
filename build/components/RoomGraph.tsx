import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface RoomGraphProps {
  participants: {
    name: string;
    history: { date: string; amount: number }[];
  }[];
}

// Define a simple color array for the lines
const COLORS = [
  '#4ADE80', // Green
  '#3B82F6', // Blue
  '#F472B6', // Pink
  '#FB923C', // Orange
  '#A78BFA', // Purple
  '#34D399', // Teal
  '#F87171', // Red
  '#FBBF24', // Yellow
];

const RoomGraph: React.FC<RoomGraphProps> = ({ participants }) => {
  // Get all unique dates from all participants
  const allDates = [...new Set(
    participants.flatMap(p => p.history.map(h => h.date))
  )].sort();

  // Get the last 6 dates for display
  const displayDates = allDates.slice(-6).map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Create datasets for each participant
  const datasets = participants.map((participant, index) => {
    // Create a cumulative dataset for this participant
    let cumulative = 0;
    const data = participant.history
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(h => {
        cumulative += h.amount;
        return cumulative;
      });

    return {
      data: data.slice(-6),
      color: () => COLORS[index % COLORS.length],
      strokeWidth: 2,
    };
  });

  // Find the min and max values for the Y axis
  const allValues = participants.flatMap(p => {
    let cum = 0;
    return p.history.map(h => {
      cum += h.amount;
      return cum;
    });
  });
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues, 0);
  const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room Progress</Text>
      {participants.length > 0 && participants.some(p => p.history.length > 0) ? (
        <>
          <View style={styles.legendContainer}>
            {participants.map((participant, index) => (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendDot, 
                    { backgroundColor: COLORS[index % COLORS.length] }
                  ]} 
                />
                <Text style={styles.legendText}>{participant.name}</Text>
              </View>
            ))}
          </View>
          <LineChart
            data={{
              labels: displayDates,
              datasets: datasets,
            }}
            width={Dimensions.get('window').width - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#1E293B',
              backgroundGradientFrom: '#1E293B',
              backgroundGradientTo: '#1E293B',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
              },
              propsForLabels: {
                fontSize: 10,
              },
            }}
            bezier
            style={styles.chart}
            withDots={true}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            yAxisInterval={5}
            yAxisSuffix=""
            yAxisLabel="$"
            segments={5}
          />
        </>
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
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 5,
  },
  legendText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default RoomGraph; 