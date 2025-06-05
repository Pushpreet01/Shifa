import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarDay } from '../types/calendar';
import { CalendarEvent } from '../services/calendarService';
import { Ionicons } from '@expo/vector-icons';

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
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, empty: true });
    }
    
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
        <TouchableOpacity onPress={onPrevMonth}>
          <Ionicons name="chevron-back-outline" size={24} color={styles.arrowButton.color} />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={onNextMonth}>
          <Ionicons name="chevron-forward-outline" size={24} color={styles.arrowButton.color} />
        </TouchableOpacity>
      </View>

      {/* Days of Week Header */}
      <View style={styles.daysOfWeekRow}>
        {daysOfWeek.map((day, index) => (
          <View key={index} style={styles.dayOfWeekCell}>
            <Text style={styles.dayOfWeekText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {generateCalendarDays().map((day, index) => (
          <View key={index} style={styles.dayCell}>
            <TouchableOpacity
              style={[
                styles.calendarDay,
                day.isSelected && styles.selectedDay,
                pressedIndex === index && styles.pressedDay,
              ]}
              onPress={() => day.date && onDateSelect(day.date)}
              onPressIn={() => setPressedIndex(index)}
              onPressOut={() => setPressedIndex(null)}
              disabled={!day.date}
            >
              {day.date ? (
                <>
                  <Text style={[
                    styles.calendarDayText,
                    day.isSelected && styles.selectedDayText
                  ]}>
                    {day.date.getDate()}
                  </Text>
                  {day.hasEvents && <View style={styles.eventDot} />}
                </>
              ) : null}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#2E2E2E",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E2E2E",
  },
  arrowButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E2E2E',
    paddingHorizontal: 15,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayOfWeekCell: {
    width: 36,  // Must match dayCell width
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '500',
    color: "#2E2E2E",
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: 36,  // Fixed width
    height: 36, // Fixed height
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: "#2E2E2E",
    textAlign: 'center',
  },
  selectedDay: {
    backgroundColor: '#1B6B63',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F4A941',
    marginTop: 2,
  },
  pressedDay: {
    backgroundColor: '#2A9D8F',
  },
});

export default Calendar;