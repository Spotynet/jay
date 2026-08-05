import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { AppText } from '../../../components/ui/AppText';

const ENERGY_COLOR = '#EAB308';

interface FeelingsSectionProps {
  moodScore: number | null;
  energyScore: number | null;
  onMoodChange: (val: number | null) => void;
  onEnergyChange: (val: number | null) => void;
  onRelease?: () => void;
}

const SCORE_MIN = 1;
const SCORE_MAX = 10;

const ScoreSlider = ({ label, value, onChange, color, onRelease }: { label: string; value: number | null; onChange: (v: number | null) => void; color: string; onRelease?: () => void }) => {
  const { colors, isDark } = useTheme();
  const trackWidth = useRef(0);
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  const normalize = (x: number) => {
    const pct = Math.max(0, Math.min(1, x / (trackWidth.current || 1)));
    return Math.round(SCORE_MIN + pct * (SCORE_MAX - SCORE_MIN));
  };

  const getThumbX = () => {
    if (value === null) return trackWidth.current * 0.5;
    const pct = (value - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
    return pct * trackWidth.current;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2,
      onPanResponderMove: (_, gestureState) => {
        const x = gestureState.dx + getThumbX();
        const score = normalize(x);
        if (score >= SCORE_MIN && score <= SCORE_MAX) {
          onChange(score);
        }
      },
      onPanResponderRelease: () => {
        onReleaseRef.current?.();
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const thumbX = getThumbX();
  const filled = value !== null ? (value - SCORE_MIN) / (SCORE_MAX - SCORE_MIN) : 0;

  return (
    <View style={styles.sliderWrap}>
      <View style={styles.labelRow}>
        <AppText style={[styles.rowLabel, { color: colors.text }]}>{label}</AppText>
        <AppText style={[styles.sliderValue, { color: value ? color : colors.subtext }]}>
          {value ? `${value}` : '—'}
        </AppText>
      </View>
      <View style={styles.sliderRow}>
        <AppText style={[styles.endLabel, { color: colors.subtext }]}>{SCORE_MIN}</AppText>
        <View
          style={styles.sliderContainer}
          onLayout={onLayout}
          {...panResponder.panHandlers}
        >
          <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
          {Array.from({ length: SCORE_MAX - SCORE_MIN + 1 }, (_, i) => i + SCORE_MIN).map((n) => (
            <View
              key={n}
              style={[
                styles.tick,
                {
                  left: `${((n - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100}%` as any,
                  backgroundColor: value !== null && n <= value ? color : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
                },
              ]}
            />
          ))}
          <View
            style={[
              styles.track,
              styles.trackFilled,
              {
                width: `${filled * 100}%` as any,
                backgroundColor: color,
                opacity: 0.35,
              },
            ]}
          />
<View
              style={[
                styles.thumb,
                {
                  left: thumbX - 8.1,
                backgroundColor: color,
                shadowColor: color,
                opacity: value ? 1 : 0.3,
                transform: [{ scale: value ? 1 : 0.8 }],
              },
            ]}
          />
        </View>
        <AppText style={[styles.endLabel, { color: colors.subtext }]}>{SCORE_MAX}</AppText>
      </View>
    </View>
  );
};

export const FeelingsSection = ({ moodScore, energyScore, onMoodChange, onEnergyChange, onRelease }: FeelingsSectionProps) => {
  const { entityColors } = useTheme();
  return (
    <View style={styles.rows}>
      <View style={styles.row}>
        <ScoreSlider label="Mood" value={moodScore} onChange={onMoodChange} color={entityColors.journal} onRelease={onRelease} />
      </View>
      <View style={styles.row}>
        <ScoreSlider label="Energy" value={energyScore} onChange={onEnergyChange} color={ENERGY_COLOR} onRelease={onRelease} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rows: {
    gap: 20,
  },
  row: {
    gap: 14,
  },
  sliderWrap: { gap: 10 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    lineHeight: 18,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sliderContainer: { flex: 1, height: 24, justifyContent: 'center' },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  trackFilled: { right: undefined },
  tick: {
    position: 'absolute',
    top: 9,
    width: 1,
    height: 6,
    borderRadius: 1,
    transform: [{ translateX: -0.5 }],
  },
  thumb: {
    position: 'absolute',
    width: 16.2,
    height: 16.2,
    borderRadius: 8.1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  endLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
    minWidth: 12,
    textAlign: 'center',
  },
});
