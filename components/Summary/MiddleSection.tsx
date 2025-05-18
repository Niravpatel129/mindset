import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Define the structure for each day cell's data
interface DayCellData {
  day: number | null; // Day number, or null for empty cells
  state: 'normal' | 'selected' | 'patterned' | 'empty' | 'past';
}

interface MiddleSectionProps {
  currentDate?: string; // Should be a parseable date string e.g., "Month Day, Year"
  dayLabels?: string[];
  calendarData?: DayCellData[];
  onPressCalendarIcon?: () => void; // For the calendar icon
}

const WEEKS_TO_DISPLAY = 2;
const DAYS_IN_WEEK = 7;

// Helper function to chunk the flat array into rows for the grid
function chunkArray(array: DayCellData[], size: number): DayCellData[][] {
  const chunkedArr: DayCellData[][] = [];
  let index = 0;
  while (index < array.length) {
    chunkedArr.push(array.slice(index, size + index));
    index += size;
  }
  // Pad the last chunk if it's not full
  if (chunkedArr.length > 0) {
    const lastChunk = chunkedArr[chunkedArr.length - 1];
    while (lastChunk.length < size) {
      lastChunk.push({ day: null, state: 'empty' });
    }
  }
  return chunkedArr;
}

// Helper function to generate calendar data dynamically
function generateDynamicCalendarData(referenceDate: Date): DayCellData[] {
  const data: DayCellData[] = [];
  const startDate = new Date(referenceDate);
  startDate.setDate(referenceDate.getDate() - 3); // Set startDate to 3 days before the referenceDate

  const today = new Date(); // Get current date for comparison
  // Normalize 'today' to the start of the day for accurate comparison
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < WEEKS_TO_DISPLAY * DAYS_IN_WEEK; i++) {
    const currentDateIter = new Date(startDate);
    currentDateIter.setDate(startDate.getDate() + i);
    // Normalize 'currentDateIter' to the start of the day
    currentDateIter.setHours(0, 0, 0, 0);

    const dayNumber = currentDateIter.getDate();
    let state: DayCellData['state'] = 'normal';

    // Check if currentDateIter is the same day as referenceDate (e.g., today if referenceDate is today)
    if (
      currentDateIter.getFullYear() === referenceDate.getFullYear() &&
      currentDateIter.getMonth() === referenceDate.getMonth() &&
      currentDateIter.getDate() === referenceDate.getDate()
    ) {
      state = 'selected';
    } else if (currentDateIter < today) {
      // Check if the date is in the past
      state = 'past';
    }
    // else, state remains 'normal' or could be 'patterned' based on other logic if added later

    data.push({ day: dayNumber, state });
  }
  return data;
}

const defaultDayLabels = ['Sat', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun'];

export default function MiddleSection({
  currentDate,
  dayLabels = defaultDayLabels,
  calendarData,
  onPressCalendarIcon,
}: MiddleSectionProps) {
  let effectiveDate: Date;
  if (currentDate) {
    const parsedDate = new Date(currentDate);
    // Check if parsing was successful
    if (!isNaN(parsedDate.getTime())) {
      effectiveDate = parsedDate;
    } else {
      // Fallback to today if parsing failed
      effectiveDate = new Date();
    }
  } else {
    // Default to today if currentDate prop is not provided
    effectiveDate = new Date();
  }

  const displayedDateString = effectiveDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dataForGrid = calendarData ? calendarData : generateDynamicCalendarData(effectiveDate);
  const calendarGrid = chunkArray(dataForGrid, DAYS_IN_WEEK);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.dateText}>{displayedDateString}</Text>
      </View>

      <View style={styles.dayLabelsContainer}>
        {dayLabels.map((label, index) => (
          <Text key={index} style={[styles.dayLabelText, index > 0 && { marginLeft: 1 }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.gridContainer}>
        {calendarGrid.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((cellData, dayIndex) => {
              if (cellData.state === 'empty' || cellData.day === null) {
                return (
                  <View
                    key={dayIndex}
                    style={[styles.circle, styles.emptyCircle, dayIndex > 0 && { marginLeft: 1 }]}
                  />
                );
              }

              let circleStyle = styles.normalCircle;
              let textStyle = styles.normalCircleText;

              if (cellData.state === 'selected') {
                circleStyle = styles.selectedCircle;
                textStyle = styles.selectedCircleText;
              } else if (cellData.state === 'patterned') {
                circleStyle = styles.patternedCircle;
                // textStyle remains styles.normalCircleText for patterned
              } else if (cellData.state === 'past') {
                circleStyle = styles.pastCircle;
                textStyle = styles.pastCircleText; // Or normalCircleText if no specific text style for past
              }

              return (
                <View
                  key={dayIndex}
                  style={[styles.circle, circleStyle, dayIndex > 0 && { marginLeft: 1 }]}
                >
                  <Text style={textStyle}>{cellData.day}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },

  calendarIconText: {
    fontSize: 20, // Adjust as needed for emoji or icon
  },
  dayLabelsContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Removed
  },
  dayLabelText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    // width: 80, // Removed
    flex: 1, // Added
    textAlign: 'center', // Kept
  },
  gridContainer: {},
  weekRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Removed
    marginBottom: 10, // Space between weeksthz
    width: '100%',
  },
  circle: {
    // width: 80, // Removed
    // height: 80, // Removed
    // borderRadius: 20, // Changed
    borderRadius: 500, // Ensures circle shape with aspectRatio: 1
    justifyContent: 'center',
    alignItems: 'center',
    // marginHorizontal: 2, // Removed, spacing handled by marginLeft
    flex: 1, // Added for flexible sizing
    aspectRatio: 1, // Added to maintain square shape for circle
  },
  emptyCircle: {
    backgroundColor: 'transparent', // Or a very faint color
    borderColor: 'transparent',
  },
  normalCircle: {
    backgroundColor: '#FFFFFF', // Light cream/off-white
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  normalCircleText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedCircle: {
    backgroundColor: '#000000', // Black
    borderColor: '#000000',
    borderWidth: 1, // Ensured borderWidth is present
  },
  selectedCircleText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  patternedCircle: {
    backgroundColor: '#FFF7EE', // Light cream/off-white for now
    borderColor: '#E0E0E0', // Subtle border
    borderWidth: 1, // Ensured borderWidth is present
    // Striped pattern would be an advanced addition here (e.g. using an overlay or SVG)
  },
  pastCircle: {
    backgroundColor: '#c8dcdb', // Color for past days
    borderWidth: 1,
    borderColor: '#b0cac9', // Slightly darker border for past days
  },
  pastCircleText: {
    fontSize: 16,
    color: '#506665', // Darker text color for readability on the past day color
  },
  // Removed old styles: title, progress
});
