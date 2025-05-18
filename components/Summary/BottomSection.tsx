import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// It's good practice to define your name and image source outside the component,
// or pass them as props if they are dynamic.
const userName = 'Max';

interface InsightCardProps {
  id: string;
  title: string;
  color: string;
  placeholderColor: string;
  details: string;
}

const insights: InsightCardProps[] = [
  {
    id: '1',
    title: 'Diversity And Inclusion',
    color: '#FDECEA',
    placeholderColor: '#FFB6C1',
    details:
      'Details about Diversity and Inclusion. This is a longer paragraph to test how the text wraps and the card expands. We want to ensure that the layout remains clean and readable even with more content.',
  },
  {
    id: '2',
    title: 'Arabic Mental Health',
    color: '#E0F2F1',
    placeholderColor: '#AFEEEE',
    details:
      'Details about Arabic Mental Health. This section can also contain multiple sentences to properly simulate real-world content and test the accordion expansion.',
  },
  {
    id: '3',
    title: 'The Ability to Defend Your Own',
    color: '#E3E4FA',
    placeholderColor: '#D8BFD8',
    details:
      'Details about The Ability to Defend Your Own. Let us add some more text here to see how the card handles it. The goal is a smooth expansion and clear presentation of information.',
  },
];

const { width } = Dimensions.get('window');

export default function BottomSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.dailyReflectionText}>Insights</Text>
      <View style={styles.insightsListContainer}>
        {insights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={[
              styles.card,
              { backgroundColor: insight.color },
              expandedId === insight.id && styles.cardExpanded,
            ]}
            activeOpacity={0.7}
            onPress={() => toggleExpand(insight.id)}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.imagePlaceholder, { backgroundColor: insight.placeholderColor }]}
              />
              <Text
                style={styles.cardTitle}
                numberOfLines={expandedId === insight.id ? undefined : 2}
              >
                {insight.title}
              </Text>
              <View style={styles.chevronContainer}>
                <Text style={styles.chevronIcon}>{expandedId === insight.id ? '▲' : '▼'}</Text>
              </View>
            </View>
            {expandedId === insight.id && (
              <View style={styles.detailsContent}>
                <Text style={styles.detailsText}>{insight.details}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: 0,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  dailyReflectionText: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 20,
    fontFamily: 'System',
    paddingTop: 40,
    paddingHorizontal: 25,
  },
  insightsListContainer: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'column',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardExpanded: {},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'System',
    marginRight: 10,
  },
  chevronContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    fontSize: 12,
    color: '#333',
  },
  detailsContent: {
    marginTop: 5,
    paddingHorizontal: 5,
  },
  detailsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
