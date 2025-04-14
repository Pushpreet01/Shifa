// components/Calendar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarDay } from '../types/calendar';
import { CalendarEvent } from '../services/calendarService';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: CalendarEvent[];
  currentMonth: Date;
  onNextMonth: () => void;
  onPrevMonth: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  events,
  currentMonth,
  onNextMonth,
  onPrevMonth
}) => {
  // Days of the week headers
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Function to generate calendar days for the current month view
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Add empty slots for days before first day of month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, empty: true });
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const hasEvents = events.some(event => 
        event.date.getDate() === day && 
        event.date.getMonth() === month &&
        event.date.getFullYear() === year
      );
      days.push({ 
        date, 
        hasEvents,
        isSelected: selectedDate && 
                    date.getDate() === selectedDate?.getDate() && 
                    date.getMonth() === selectedDate?.getMonth() &&
                    date.getFullYear() === selectedDate?.getFullYear()
      });
    }
    
    return days;
  };

  return (
    <View style={styles.calendarContainer}>
      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <Text style={styles.monthYearText}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.monthArrows}>
          <TouchableOpacity onPress={onPrevMonth}>
            <Text style={styles.arrowButton}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNextMonth}>
            <Text style={styles.arrowButton}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Days of Week Header */}
      <View style={styles.daysOfWeekRow}>
        {daysOfWeek.map((day, index) => (
          <Text key={index} style={styles.dayOfWeekText}>{day}</Text>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {generateCalendarDays().map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.calendarDay,
              day.isSelected && styles.selectedDay,
              day.empty && styles.emptyDay
            ]}
            onPress={() => day.date && onDateSelect(day.date)}
            disabled={day.empty}
          >
            {day.date && (
              <View>
                <Text style={[
                  styles.calendarDayText,
                  day.isSelected && styles.selectedDayText
                ]}>
                  {day.date.getDate()}
                </Text>
                {day.hasEvents && <View style={styles.eventDot} />}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    
  calendarContainer: {
    marginTop: 10,
    backgroundColor: "#FFF9E5",
    borderRadius: 10,
    padding: 15,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3A7D44",
    textAlign: "center",
    marginBottom: 10,
  },
  monthArrows: {
    flexDirection: 'row',
  },
  arrowButton: {
    fontSize: 18,
    color: '#3A7D44',
    paddingHorizontal: 10,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  dayOfWeekText: {
    fontSize: 14,
    color: "#3A7D44",
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  calendarDayText: {
    fontSize: 14,
    color: "#3A7D44",
    textAlign: "center",
  },
  selectedDay: {
    backgroundColor: '#9DC08B',
    borderRadius: 15,
  },
  selectedDayText: {
    backgroundColor: "#9DC08B",
    color: "#FFFFFF",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A7D44',
    marginTop: 2,
    alignSelf: 'center',
  },
});

export default Calendar;