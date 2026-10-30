import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import ScreenLayout from '../../components/common/ScreenLayout';
import { AppText } from '../../components/ui/AppText';
import { ItemDetailsShell } from '../../components/itemDetails/ItemDetailsShell';
import { ItemDetailsOverflowButton } from '../../components/itemDetails/ItemDetailsOverflowButton';
import { DetailsIdentity } from '../../components/itemDetails/DetailsIdentity';
import { DetailsPrimaryAction } from '../../components/itemDetails/DetailsPrimaryAction';
import type { DetailsOverflowAction } from '../../components/itemDetails/detailsOverflowTypes';
import {
  HabitDetailsBody,
  TaskDetailsBody,
  EventDetailsBody,
} from '../../components/itemDetails/typeBodies';
import {
  ItemDetailsKind,
  ItemDetailsParams,
  headerTitleFor,
} from '../../components/itemDetails/types';
import { ENTITY_ICONS } from '../../constants/entityIcons';
import { HABIT_ICONS } from '../../constants/habitIcons';
import {
  formatHabitGoal,
  formatClockTime,
  formatFriendlyDate,
} from '../../utils/itemDetailsFormat';
import { confirmHabitDelete } from '../../utils/confirmHabitDelete';
import {
  getHabitById,
  deleteHabit,
  toggleHabitCompletion,
  incrementHabitProgress,
  decrementHabitProgress,
} from '../../api/habits';
import { getTaskById, deleteTask, toggleTaskCompletion } from '../../api/tasks';
import { getEventById, deleteEvent } from '../../api/events';

function dismissDetails(navigation: any) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  navigation.navigate('Tabs', { screen: 'Today' });
}

function resolveHabitIcon(iconName?: string | null) {
  if (!iconName) return ENTITY_ICONS.habit;
  return HABIT_ICONS.find((i) => i.name === iconName)?.icon || ENTITY_ICONS.habit;
}

/**
 * Full-screen timeline item details — same MainStack modal pattern as Profile.
 * Shared visual grammar; type-specific content stays in typeBodies + lead builders.
 */
export default function ItemDetailsScreen() {
  const { colors, entityColors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();

  const params = (route.params || {}) as Partial<ItemDetailsParams>;
  const kind = params.kind as ItemDetailsKind | undefined;
  const entityId = params.entityId;
  const occurrenceDate = params.occurrenceDate || '';
  const projectName = params.projectName;

  const [entity, setEntity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [progressBusy, setProgressBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(!!params.isCompleted);
  const [progress, setProgress] = useState(0);
  /** Prevents duplicate delete mutations from rapid confirm taps. */
  const deletingRef = useRef(false);

  const accent =
    kind === 'habit'
      ? entityColors.habits
      : kind === 'task'
        ? entityColors.tasks
        : entityColors.events;

  const reload = useCallback(async () => {
    if (!kind || !entityId) {
      setLoadError('This item is unavailable.');
      setEntity(null);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const id = Number(entityId);
      let data: any;
      if (kind === 'habit') data = await getHabitById(id, occurrenceDate || undefined);
      else if (kind === 'task') data = await getTaskById(id);
      else data = await getEventById(id);
      setEntity(data);
      if (kind === 'habit') {
        setCompleted(!!(data?.completed ?? params.isCompleted));
        setProgress(typeof data?.progress === 'number' ? data.progress : 0);
      } else if (kind === 'task') {
        setCompleted(data?.status === 'COMPLETED' || !!params.isCompleted);
      } else {
        setCompleted(false);
      }
    } catch {
      setLoadError("Couldn't load this item.");
      setEntity(null);
    } finally {
      setLoading(false);
    }
  }, [kind, entityId, occurrenceDate, params.isCompleted]);

  useEffect(() => {
    deletingRef.current = false;
    setActionError(null);
    setCompleted(!!params.isCompleted);
    reload();
  }, [kind, entityId, occurrenceDate, reload, params.isCompleted]);

  useEffect(() => {
    if (isFocused && kind && entityId) {
      reload();
    }
  }, [isFocused]);

  const title = entity?.name || 'Item';

  const iconComponent = useMemo(() => {
    if (!kind) return ENTITY_ICONS.task;
    if (kind === 'habit') return resolveHabitIcon(entity?.icon);
    if (kind === 'task') return ENTITY_ICONS.task;
    return ENTITY_ICONS.event;
  }, [kind, entity?.icon]);

  const isMeasurableCount =
    kind === 'habit' &&
    !!entity?.has_target &&
    entity?.target_type === 'COUNT' &&
    typeof entity?.target_value === 'number' &&
    entity.target_value > 0;

  const supportsCompletion =
    (kind === 'habit' && !isMeasurableCount) || kind === 'task';
  const supportsDelete = kind === 'habit' || kind === 'task' || kind === 'event';

  const handleEdit = () => {
    if (!kind || !entity) return;
    if (kind === 'habit') {
      navigation.navigate('HabitEntry', {
        habit: entity,
        occurrenceDate,
        fromDetails: true,
      });
    } else if (kind === 'task') {
      navigation.navigate('TaskEntry', {
        task: entity,
        occurrenceDate,
      });
    } else {
      navigation.navigate('EventEntry', {
        event: entity,
        occurrenceDate,
      });
    }
  };

  const performDelete = useCallback(async () => {
    if (!kind || !entityId || deletingRef.current) return;
    deletingRef.current = true;
    setActionError(null);
    try {
      const id = Number(entityId);
      if (kind === 'habit') await deleteHabit(id);
      else if (kind === 'task') await deleteTask(id);
      else if (kind === 'event') await deleteEvent(id);
      dismissDetails(navigation);
    } catch {
      deletingRef.current = false;
      setActionError("Couldn't delete this item.");
    }
  }, [kind, entityId, navigation]);

  const requestDelete = useCallback(() => {
    if (!kind || !entityId || deletingRef.current) return;
    if (kind === 'habit') {
      confirmHabitDelete(entity?.name || title, () => {
        void performDelete();
      });
      return;
    }
    if (kind === 'task') {
      // Tasks are single records (not occurrence series). Subtasks cascade-delete.
      const hasSubtasks = Array.isArray(entity?.subtasks) && entity.subtasks.length > 0;
      const label = (entity?.name || title || 'this task').trim() || 'this task';
      Alert.alert(
        'Delete task?',
        hasSubtasks
          ? `Delete “${label}” and its subtasks? This can’t be undone.`
          : `Delete “${label}”? This can’t be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Task',
            style: 'destructive',
            onPress: () => {
              void performDelete();
            },
          },
        ],
      );
      return;
    }
    if (kind === 'event') {
      const label = (entity?.name || title || 'this event').trim() || 'this event';
      Alert.alert(
        'Delete event?',
        `Delete “${label}”? This can’t be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Event',
            style: 'destructive',
            onPress: () => {
              void performDelete();
            },
          },
        ],
      );
    }
  }, [kind, entityId, entity, title, performDelete]);

  const overflowActions = useMemo((): DetailsOverflowAction[] => {
    const actions: DetailsOverflowAction[] = [
      {
        key: 'edit',
        label: 'Edit',
        systemImage: 'pencil',
        onPress: handleEdit,
      },
    ];
    if (supportsDelete) {
      actions.push({
        key: 'delete',
        label: 'Delete',
        systemImage: 'trash',
        destructive: true,
        onPress: requestDelete,
      });
    }
    return actions;
    // handleEdit / supportsDelete / requestDelete close over current entity context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, entity, occurrenceDate, supportsDelete, requestDelete]);

  const handleToggleComplete = async () => {
    if (!kind || !entityId || !supportsCompletion || completing) return;
    if (kind === 'habit' && !occurrenceDate) {
      setActionError('Missing occurrence date.');
      return;
    }
    setCompleting(true);
    setActionError(null);
    const previous = completed;
    setCompleted(!previous);
    try {
      const id = Number(entityId);
      if (kind === 'habit') {
        await toggleHabitCompletion(id, occurrenceDate);
      } else {
        await toggleTaskCompletion(id);
      }
      await reload();
    } catch {
      setCompleted(previous);
      setActionError("Couldn't update completion.");
    } finally {
      setCompleting(false);
    }
  };

  const handleIncrement = async () => {
    if (!entityId || !occurrenceDate || progressBusy) return;
    setProgressBusy(true);
    setActionError(null);
    const previousProgress = progress;
    const previousCompleted = completed;
    const target = entity?.target_value ?? 1;
    const next = Math.min(previousProgress + 1, target);
    setProgress(next);
    setCompleted(next >= target);
    try {
      await incrementHabitProgress(Number(entityId), occurrenceDate);
      await reload();
    } catch {
      setProgress(previousProgress);
      setCompleted(previousCompleted);
      setActionError("Couldn't update progress.");
    } finally {
      setProgressBusy(false);
    }
  };

  const handleDecrement = async () => {
    if (!entityId || !occurrenceDate || progressBusy) return;
    setProgressBusy(true);
    setActionError(null);
    const previousProgress = progress;
    const previousCompleted = completed;
    const target = entity?.target_value ?? 1;
    const next = Math.max(previousProgress - 1, 0);
    setProgress(next);
    setCompleted(next >= target);
    try {
      await decrementHabitProgress(Number(entityId), occurrenceDate);
      await reload();
    } catch {
      setProgress(previousProgress);
      setCompleted(previousCompleted);
      setActionError("Couldn't update progress.");
    } finally {
      setProgressBusy(false);
    }
  };

  let detailsLead: React.ReactNode = null;
  if (entity && kind) {
    if (kind === 'habit') {
      const occurrenceA11y =
        formatFriendlyDate(occurrenceDate) || occurrenceDate || 'selected day';
      detailsLead = (
        <View>
          <DetailsIdentity
            title={title}
            iconComponent={iconComponent}
            accent={accent}
            completion={
              isMeasurableCount
                ? null
                : {
                    completed,
                    completing,
                    onToggle: handleToggleComplete,
                    accessibilityLabel: completed
                      ? `${title}, completed for ${occurrenceA11y}. Double tap to undo`
                      : `${title}, not completed for ${occurrenceA11y}. Double tap to mark complete`,
                  }
            }
          />
          <DetailsPrimaryAction
            occurrenceDate={occurrenceDate}
            occurrenceTime={formatClockTime(entity.reminder_time)}
            untimedLabel="Anytime"
            accent={accent}
            completed={completed}
            completing={completing}
            onToggleComplete={handleToggleComplete}
            actionError={actionError}
            showBinaryAction={false}
            goalLabel={
              isMeasurableCount && entity.has_target
                ? formatHabitGoal(entity)
                : null
            }
            measurable={
              isMeasurableCount
                ? {
                    progress,
                    target: entity.target_value,
                    hasTarget: true,
                    targetType: entity.target_type,
                    busy: progressBusy,
                    onIncrement: handleIncrement,
                    onDecrement: handleDecrement,
                  }
                : null
            }
          />
        </View>
      );
    } else if (kind === 'task') {
      detailsLead = (
        <View>
          <DetailsIdentity
            title={title}
            iconComponent={iconComponent}
            accent={accent}
          />
          <DetailsPrimaryAction
            occurrenceDate={occurrenceDate || entity.due_date || ''}
            occurrenceTime={formatClockTime(entity.due_time)}
            untimedLabel={null}
            accent={accent}
            completed={completed}
            completing={completing}
            onToggleComplete={handleToggleComplete}
            actionError={actionError}
          />
        </View>
      );
    } else {
      // Events: identity only — no completion action.
      detailsLead = (
        <View>
          <DetailsIdentity
            title={title}
            iconComponent={iconComponent}
            accent={accent}
          />
          {actionError ? (
            <AppText style={{ color: colors.error, marginBottom: 12 }}>{actionError}</AppText>
          ) : null}
        </View>
      );
    }
  }

  const screenTitle = kind ? headerTitleFor(kind) : 'Details';

  return (
    <ScreenLayout
      title={screenTitle}
      showClose
      constrainWidth
      contentStyle={styles.content}
      rightOption={
        entity && kind
          ? {
              render: () => (
                <ItemDetailsOverflowButton
                  actions={overflowActions}
                  accessibilityLabel="More options"
                />
              ),
            }
          : undefined
      }
    >
      <ItemDetailsShell
        loading={loading && !entity}
        loadError={
          !kind || !entityId
            ? 'This item is unavailable.'
            : loadError
        }
        lead={detailsLead}
      >
        {entity && kind === 'habit' ? (
          <HabitDetailsBody habit={entity} occurrenceDate={occurrenceDate} />
        ) : null}
        {entity && kind === 'task' ? (
          <TaskDetailsBody
            task={entity}
            projectName={projectName}
            occurrenceDate={occurrenceDate}
          />
        ) : null}
        {entity && kind === 'event' ? <EventDetailsBody event={entity} /> : null}
      </ItemDetailsShell>

    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 4,
  },
});
