import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AgendaCard } from './AgendaCard';

interface AgendaItem {
  id: string;
  title: string;
  type: string;
  timeRange: string;
  location?: string;
  isActive: boolean;
  isCompleted?: boolean;
  onToggle?: () => void;
  startTime: Date | null;
  durationMinutes?: number;
}

interface TimelineAgendaProps {
  items: AgendaItem[];
  onItemPress?: (item: AgendaItem) => void;
}

const HOUR_HEIGHT = 180;
const SIDEBAR_WIDTH = 60;

export const TimelineAgenda = ({ items, onItemPress }: TimelineAgendaProps) => {
  const { accentColor } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const scrollPosition = (currentTime.getHours() * HOUR_HEIGHT) - 50;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, scrollPosition), animated: true });
    }, 500);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const nowTop = (currentTime.getHours() * 60 + currentTime.getMinutes()) / 60 * HOUR_HEIGHT;

  const allDayItems = items.filter(item => !item.startTime);
  const timedItems = items.filter(item => item.startTime !== null) as (AgendaItem & { startTime: Date })[];
  const sortedItems = [...timedItems].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  const slots: any = {};
  sortedItems.forEach(item => {
      const hour = item.startTime.getHours();
      if (!slots[hour]) slots[hour] = [];
      slots[hour].push(item);
  });

  return (
    <View style={styles.container}>
      {allDayItems.length > 0 && (
        <View style={[styles.allDayContainer, { width: '100%' }]}>
            <View style={styles.allDayHeader}>
                <Text style={styles.noTimeLabel} numberOfLines={1}>No time</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.allDayContent}>
                {allDayItems.map(item => (
                    <View key={item.id} style={styles.allDayCard}>
                        <AgendaCard
                            title={item.title}
                            type={item.type as any}
                            timeRange={item.timeRange}
                            location={item.location}
                            isActive={item.isActive}
                            isCompleted={item.isCompleted}
                            onToggle={item.onToggle}
                            onPress={() => onItemPress && onItemPress(item)}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {hours.map(hour => {
            const slotItems = slots[hour] || [];
            return (
                <View key={hour} style={[styles.hourRow, { height: HOUR_HEIGHT }]}>
                    <Text style={styles.hourLabel}>
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </Text>
                    <View style={styles.slotContainer}>
                        {slotItems.map((item: any) => {
                             const startMinutes = item.startTime.getMinutes();
                             const top = (startMinutes / 60) * HOUR_HEIGHT;
                             
                             const isEvent = item.type === 'event';
                             const isTask = item.type === 'task';
                             const isResizable = isEvent || (isTask && item.durationMinutes);
                             const defaultDuration = isTask ? 15 : 30;
                             const duration = item.durationMinutes || defaultDuration;
                             const height = Math.max((duration / 60) * HOUR_HEIGHT, 40);
                             
                             const overlaps = sortedItems.filter((p: any) => 
                                 (item.startTime.getTime() < p.startTime.getTime() + (p.durationMinutes || defaultDuration) * 60000) &&
                                 (item.startTime.getTime() + duration * 60000 > p.startTime.getTime())
                             );
                             // Sort overlaps by priority: Events (0) > Tasks (1) > Habits (2) > Journal (3)
                             const priorityMap: any = { 'event': 0, 'task': 1, 'habit': 2, 'journal': 3 };
                             overlaps.sort((a: any, b: any) => (priorityMap[a.type] ?? 99) - (priorityMap[b.type] ?? 99));
                             
                             const numCols = overlaps.length;
                             const colIndex = overlaps.indexOf(item);
                             
                             return (
                                 <View key={item.id} style={[styles.flexCard, { 
                                     position: 'absolute', 
                                     top, 
                                     height: isResizable ? height : undefined,
                                     minHeight: isResizable ? height : 20,
                                     left: `${(colIndex * (100 / numCols))}%`, 
                                     width: `${100 / numCols}%` 
                                 }]}>
                                    <AgendaCard 
                                        title={item.title}
                                        type={item.type as any}
                                        timeRange={item.timeRange}
                                        location={item.location}
                                        isActive={item.isActive}
                                        isCompleted={item.isCompleted}
                                        onToggle={item.onToggle}
                                        onPress={() => onItemPress && onItemPress(item)}
                                        startTime={item.startTime}
                                        durationMinutes={item.durationMinutes}
                                        verticalAlign={!isResizable ? 'center' : 'flex-start'}
                                    />
                                 </View>
                             );
                        })}
                        <View style={styles.divider} />
                    </View>
                </View>
            );
        })}

        <View style={[styles.nowLine, { top: nowTop + 20, backgroundColor: accentColor }]}>
          <View style={[styles.nowBulb, { backgroundColor: accentColor }]} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  allDayContainer: { borderBottomWidth: 0.5, borderBottomColor: '#222', paddingVertical: 10 },
  allDayHeader: { marginBottom: 5 },
  noTimeLabel: { fontSize: 11, fontWeight: '400', color: '#666', letterSpacing: 2, marginLeft: 10 },
  allDayContent: { flexDirection: 'row', gap: 10 },
  allDayCard: { width: 300 }, // Restore card width constraint
  scrollContent: { paddingBottom: 100 },
  hourRow: { flexDirection: 'row', alignItems: 'flex-start' },
  hourRowSmall: { flexDirection: 'row', alignItems: 'center' },
  hourLabel: { width: SIDEBAR_WIDTH, fontSize: 9, color: '#666', textAlign: 'center', paddingLeft: 0, textTransform: 'uppercase' },
  slotContainer: { flex: 1, flexDirection: 'row', position: 'relative', zIndex: 1 },
  divider: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 0.5, backgroundColor: '#222', zIndex: -1 },
  flexCard: { zIndex: 100 },
  nowLine: { position: 'absolute', left: SIDEBAR_WIDTH, right: 0, height: 1 },
  nowBulb: { position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: 4 }
});
