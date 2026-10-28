import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  IconX,
  IconDotsVertical,
  IconCheck,
} from 'tabler-icons-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon } from '../ui/Icon';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { HABIT_ICONS } from '../../constants/habitIcons';
import DeleteConfirm from '../ui/DeleteConfirm';
import { ItemOverflowMenu } from './ItemOverflowMenu';
import { HabitDetailsBody, TaskDetailsBody, EventDetailsBody } from './typeBodies';
import {
  formatHabitSummaryLine,
  formatClockTime,
  formatFriendlyDate,
} from '../../utils/itemDetailsFormat';
import { getHabitById, deleteHabit, toggleHabitCompletion } from '../../api/habits';
import { getTaskById, deleteTask, toggleTaskCompletion } from '../../api/tasks';
import { getEventById } from '../../api/events';

export type ItemDetailsKind = 'habit' | 'task' | 'event';

export type ItemDetailsPayload = {
  kind: ItemDetailsKind;
  entityId: string;
  occurrenceDate: string;
  /** Optional project name for tasks. */
  projectName?: string;
  /** Initial completion from the agenda card. */
  isCompleted?: boolean;
};

interface ItemDetailsModalProps {
  visible: boolean;
  payload: ItemDetailsPayload | null;
  onClose: () => void;
  onTimelineRefresh: () => void;
}

const DESKTOP_MIN = 720;
const DESKTOP_WIDTH = 640;
const CLEARANCE = 28;
const ENTER_MS = 260;

function headerTitleFor(kind: ItemDetailsKind): string {
  if (kind === 'habit') return 'Habit details';
  if (kind === 'task') return 'Task details';
  return 'Event details';
}

function categoryLabel(kind: ItemDetailsKind): string {
  if (kind === 'habit') return 'Habit';
  if (kind === 'task') return 'Task';
  return 'Event';
}

export function ItemDetailsModal({
  visible,
  payload,
  onClose,
  onTimelineRefresh,
}: ItemDetailsModalProps) {
  const { colors, entityColors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isFocused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  const [entity, setEntity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const desktop = Platform.OS === 'web' && width >= DESKTOP_MIN;
  const kind = payload?.kind;
  const accent =
    kind === 'habit'
      ? entityColors.habits
      : kind === 'task'
        ? entityColors.tasks
        : entityColors.events;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setSystemReduceMotion).catch(() => {});
  }, []);

  const motionOff = !!reduceMotion || systemReduceMotion;

  const reload = useCallback(async () => {
    if (!payload) return;
    setLoading(true);
    setLoadError(null);
    try {
      const id = Number(payload.entityId);
      let data: any;
      if (payload.kind === 'habit') data = await getHabitById(id);
      else if (payload.kind === 'task') data = await getTaskById(id);
      else data = await getEventById(id);
      setEntity(data);
      if (payload.kind === 'habit') {
        setCompleted(!!(data?.completed ?? payload.isCompleted));
      } else if (payload.kind === 'task') {
        setCompleted(data?.status === 'COMPLETED' || !!payload.isCompleted);
      } else {
        setCompleted(false);
      }
    } catch {
      setLoadError("Couldn't load this item.");
      setEntity(null);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  useEffect(() => {
    if (visible && payload) {
      setMenuOpen(false);
      setDeleteVisible(false);
      setActionError(null);
      setCompleted(!!payload.isCompleted);
      reload();
    } else if (!visible) {
      setEntity(null);
      setLoadError(null);
    }
  }, [visible, payload?.kind, payload?.entityId, payload?.occurrenceDate]);

  // Refresh after returning from the editor route.
  useEffect(() => {
    if (visible && isFocused && payload) {
      reload();
    }
  }, [isFocused]);

  const title = entity?.name || 'Item';
  const summaryLine = useMemo(() => {
    if (!entity || !kind) return '';
    if (kind === 'habit') return formatHabitSummaryLine(entity);
    if (kind === 'task') {
      const date = formatFriendlyDate(entity.due_date || payload?.occurrenceDate);
      const time = formatClockTime(entity.due_time);
      if (date && time) return `${date} · ${time}`;
      return date || time || 'Unscheduled';
    }
    const date = formatFriendlyDate(entity.date);
    const time = formatClockTime(entity.start_time);
    if (date && time) return `${date} · ${time}`;
    return date || time || '';
  }, [entity, kind, payload?.occurrenceDate]);

  const iconComponent = useMemo(() => {
    if (!kind) return ENTITY_ICONS.task;
    if (kind === 'habit') {
      const name = entity?.icon;
      return HABIT_ICONS.find((i) => i.name === name)?.icon || ENTITY_ICONS.habit;
    }
    if (kind === 'task') return ENTITY_ICONS.task;
    return ENTITY_ICONS.event;
  }, [kind, entity?.icon]);

  const supportsCompletion = kind === 'habit' || kind === 'task';
  const supportsDelete = kind === 'habit' || kind === 'task';

  const handleEdit = () => {
    if (!payload || !entity) return;
    setMenuOpen(false);
    if (payload.kind === 'habit') {
      navigation.navigate('HabitEntry', {
        habit: entity,
        occurrenceDate: payload.occurrenceDate,
      });
    } else if (payload.kind === 'task') {
      navigation.navigate('TaskEntry', {
        task: entity,
        occurrenceDate: payload.occurrenceDate,
      });
    } else {
      navigation.navigate('EventEntry', {
        event: entity,
        occurrenceDate: payload.occurrenceDate,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!payload) return;
    try {
      const id = Number(payload.entityId);
      if (payload.kind === 'habit') await deleteHabit(id);
      else if (payload.kind === 'task') await deleteTask(id);
      setDeleteVisible(false);
      onTimelineRefresh();
      onClose();
    } catch {
      setDeleteVisible(false);
      setActionError("Couldn't delete this item.");
    }
  };

  const handleToggleComplete = async () => {
    if (!payload || !supportsCompletion || completing) return;
    setCompleting(true);
    setActionError(null);
    const previous = completed;
    setCompleted(!previous);
    try {
      const id = Number(payload.entityId);
      if (payload.kind === 'habit') {
        await toggleHabitCompletion(id, payload.occurrenceDate);
      } else {
        await toggleTaskCompletion(id);
      }
      onTimelineRefresh();
      await reload();
    } catch {
      setCompleted(previous);
      setActionError("Couldn't update completion.");
    } finally {
      setCompleting(false);
    }
  };

  const sheetMaxHeight = desktop ? height - CLEARANCE * 2 : height;
  const sheetWidth = desktop
    ? Math.min(DESKTOP_WIDTH, width - CLEARANCE * 2)
    : width;

  const entering = motionOff
    ? FadeIn.duration(120)
    : desktop
      ? FadeIn.duration(ENTER_MS).easing(Easing.out(Easing.cubic))
      : SlideInDown.duration(ENTER_MS).easing(Easing.out(Easing.cubic));
  const exiting = motionOff
    ? FadeOut.duration(100)
    : desktop
      ? FadeOut.duration(180)
      : SlideOutDown.duration(200).easing(Easing.in(Easing.cubic));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.root,
          desktop && styles.rootDesktop,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.4)' },
        ]}
        accessibilityViewIsModal
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close details" />

        <Animated.View
          key={visible ? 'open' : 'closed'}
          entering={entering}
          exiting={exiting}
          style={[
            desktop ? styles.dialog : styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              width: sheetWidth,
              maxHeight: sheetMaxHeight,
              paddingBottom: desktop ? 16 : Math.max(insets.bottom, 12),
            },
          ]}
          accessible
          accessibilityLabel={kind ? headerTitleFor(kind) : 'Item details'}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                paddingTop: desktop ? 10 : Math.max(insets.top, 10),
                borderBottomColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              style={styles.headerBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Icon name={IconX} size={20} color={colors.subtext} />
            </TouchableOpacity>
            <AppText style={[styles.headerTitle, { color: colors.subtext }]} numberOfLines={1}>
              {kind ? headerTitleFor(kind) : 'Details'}
            </AppText>
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              style={styles.headerBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={title ? `More options for ${title}` : 'More options'}
            >
              <Icon name={IconDotsVertical} size={20} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading && !entity ? (
              <AppText style={{ color: colors.subtext, marginTop: 24 }}>Loading…</AppText>
            ) : null}
            {loadError ? (
              <AppText style={{ color: colors.error, marginTop: 24 }}>{loadError}</AppText>
            ) : null}

            {entity && kind ? (
              <>
                {/* Identity */}
                <View style={styles.identity}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.iconWash, { backgroundColor: accent + '1A' }]} />
                    <Icon name={iconComponent} size={24} color={accent} stroke={1.7} />
                  </View>
                  <AppText style={[styles.category, { color: accent }]}>
                    {categoryLabel(kind)}
                  </AppText>
                  <AppText style={[styles.itemTitle, { color: colors.text }]}>{title}</AppText>
                  {summaryLine ? (
                    <AppText style={[styles.summary, { color: colors.subtext }]}>
                      {summaryLine}
                    </AppText>
                  ) : null}

                  {supportsCompletion ? (
                    <TouchableOpacity
                      style={[
                        styles.completeBtn,
                        {
                          backgroundColor: completed ? accent + '22' : colors.surface,
                          borderColor: completed ? accent : colors.border,
                        },
                      ]}
                      onPress={handleToggleComplete}
                      disabled={completing}
                      accessibilityRole="button"
                      accessibilityState={{ checked: completed, busy: completing }}
                      accessibilityLabel={completed ? 'Completed' : 'Mark complete'}
                    >
                      <Icon
                        name={IconCheck}
                        size={16}
                        color={completed ? accent : colors.subtext}
                      />
                      <AppText
                        style={{
                          color: completed ? accent : colors.text,
                          fontWeight: '600',
                          fontSize: 14,
                        }}
                      >
                        {completed ? 'Completed' : 'Mark complete'}
                      </AppText>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {actionError ? (
                  <AppText style={{ color: colors.error, marginBottom: 12 }}>{actionError}</AppText>
                ) : null}

                {kind === 'habit' ? (
                  <HabitDetailsBody habit={entity} occurrenceDate={payload?.occurrenceDate} />
                ) : null}
                {kind === 'task' ? (
                  <TaskDetailsBody
                    task={entity}
                    projectName={payload?.projectName}
                    occurrenceDate={payload?.occurrenceDate}
                  />
                ) : null}
                {kind === 'event' ? <EventDetailsBody event={entity} /> : null}
              </>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>

      <ItemOverflowMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        itemTitle={title}
        anchor={{ top: (desktop ? CLEARANCE : insets.top) + 52, right: desktop ? CLEARANCE + 24 : 16 }}
        actions={[
          { key: 'edit', label: 'Edit', onPress: handleEdit },
          ...(supportsDelete
            ? [
                {
                  key: 'delete',
                  label: 'Delete',
                  destructive: true,
                  onPress: () => setDeleteVisible(true),
                },
              ]
            : []),
        ]}
      />

      <DeleteConfirm
        visible={deleteVisible}
        title={kind === 'habit' ? 'Delete Habit' : 'Delete Task'}
        message={`Are you sure you want to delete "${title}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  rootDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: CLEARANCE,
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '100%',
    overflow: 'hidden',
    // Full-height phone surface
    height: '100%',
  },
  dialog: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    maxWidth: DESKTOP_WIDTH,
    // Tall contained dialog — not a short popup
    height: '92%',
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 32,
  },
  identity: {
    marginBottom: 28,
    gap: 8,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  iconWash: {
    ...StyleSheet.absoluteFill,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  summary: {
    fontSize: 14,
    marginTop: 2,
  },
  completeBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
  },
});
