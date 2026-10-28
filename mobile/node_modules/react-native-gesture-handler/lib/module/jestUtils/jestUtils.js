"use strict";

import invariant from 'invariant';
import { DeviceEventEmitter } from 'react-native';
import { flingHandlerName } from '../handlers/FlingGestureHandler';
import { forceTouchHandlerName } from '../handlers/ForceTouchGestureHandler';
import { BaseGesture } from '../handlers/gestures/gesture';
import { findGesture, findHandlerByTestID } from '../handlers/handlersRegistry';
import { longPressHandlerName } from '../handlers/LongPressGestureHandler';
import { nativeViewHandlerName } from '../handlers/NativeViewGestureHandler';
import { panHandlerName } from '../handlers/PanGestureHandler';
import { pinchHandlerName } from '../handlers/PinchGestureHandler';
import { rotationHandlerName } from '../handlers/RotationGestureHandler';
import { tapHandlerName } from '../handlers/TapGestureHandler';
import { State } from '../State';
import { hasProperty, withPrevAndCurrent } from '../utils';
import { maybeUnpackValue } from '../v3/hooks/utils';
// Load fireEvent conditionally, so RNGH may be used in setups without testing-library
let fireEvent = (_element, _name, ..._data) => {
  // NOOP
};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fireEvent = require('@testing-library/react-native').fireEvent;
} catch (_e) {
  // Do nothing if not available
}
const handlersDefaultEvents = {
  [flingHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    numberOfPointers: 1
  },
  [forceTouchHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    force: 1,
    numberOfPointers: 1
  },
  [longPressHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    duration: 100,
    numberOfPointers: 1
  },
  [nativeViewHandlerName]: {
    pointerInside: true,
    numberOfPointers: 1
  },
  [panHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    translationX: 100,
    translationY: 0,
    velocityX: 3,
    velocityY: 0,
    numberOfPointers: 1,
    stylusData: undefined
  },
  [pinchHandlerName]: {
    focalX: 0,
    focalY: 0,
    scale: 2,
    velocity: 1,
    numberOfPointers: 2
  },
  [rotationHandlerName]: {
    anchorX: 0,
    anchorY: 0,
    rotation: 3.14,
    velocity: 2,
    numberOfPointers: 2
  },
  [tapHandlerName]: {
    x: 0,
    y: 0,
    absoluteX: 0,
    absoluteY: 0,
    numberOfPointers: 1
  }
};
function isGesture(componentOrGesture) {
  return componentOrGesture instanceof BaseGesture;
}
function isHookGesture(componentOrGesture) {
  return 'detectorCallbacks' in componentOrGesture;
}
function wrapWithNativeEvent(event) {
  return {
    nativeEvent: event
  };
}
function fillOldStateChanges(previousEvent, currentEvent) {
  const isFirstEvent = previousEvent === null;
  if (isFirstEvent) {
    return {
      oldState: State.UNDETERMINED,
      ...currentEvent
    };
  }
  const isGestureStateEvent = previousEvent.state !== currentEvent.state;
  if (isGestureStateEvent) {
    return {
      oldState: previousEvent?.state,
      ...currentEvent
    };
  } else {
    return currentEvent;
  }
}
function validateStateTransitions(previousEvent, currentEvent) {
  function stringify(event) {
    return JSON.stringify(event, null, 2);
  }
  function errorMsgWithBothEvents(description) {
    return `${description}, invalid event: ${stringify(currentEvent)}, previous event: ${stringify(previousEvent)}`;
  }
  function errorMsgWithCurrentEvent(description) {
    return `${description}, invalid event: ${stringify(currentEvent)}`;
  }
  invariant(hasProperty(currentEvent, 'state'), errorMsgWithCurrentEvent('every event must have state'));
  const isFirstEvent = previousEvent === null;
  if (isFirstEvent) {
    invariant(currentEvent.state === State.BEGAN, errorMsgWithCurrentEvent('first event must have BEGAN state'));
  }
  if (previousEvent !== null) {
    if (previousEvent.state !== currentEvent.state) {
      invariant(hasProperty(currentEvent, 'oldState'), errorMsgWithCurrentEvent('when state changes, oldState field should be present'));
      invariant(currentEvent.oldState === previousEvent.state, errorMsgWithBothEvents("when state changes, oldState should be the same as previous event' state"));
    }
  }
  return currentEvent;
}
function fillMissingDefaultsFor({
  handlerType,
  handlerTag
}) {
  return event => {
    return {
      ...handlersDefaultEvents[handlerType],
      ...event,
      handlerTag
    };
  };
}
function isDiscreteHandler(handlerType) {
  return handlerType === 'TapGestureHandler' || handlerType === 'LongPressGestureHandler';
}
function fillMissingStatesTransitions(events, isDiscreteHandler) {
  const _events = [...events];
  const lastEvent = _events[_events.length - 1] ?? null;
  const firstEvent = _events[0] ?? null;
  const shouldDuplicateFirstEvent = !isDiscreteHandler && !hasState(State.BEGAN)(firstEvent);
  if (shouldDuplicateFirstEvent) {
    const duplicated = {
      ...firstEvent,
      state: State.BEGAN
    };
    // @ts-ignore badly typed, property may exist and we don't want to copy it
    delete duplicated.oldState;
    _events.unshift(duplicated);
  }
  const shouldDuplicateLastEvent = !hasState(State.END)(lastEvent) || !hasState(State.FAILED)(lastEvent) || !hasState(State.CANCELLED)(lastEvent);
  if (shouldDuplicateLastEvent) {
    const duplicated = {
      ...lastEvent,
      state: State.END
    };
    // @ts-ignore badly typed, property may exist and we don't want to copy it
    delete duplicated.oldState;
    _events.push(duplicated);
  }
  function isWithoutState(event) {
    return event !== null && !hasProperty(event, 'state');
  }
  function hasState(state) {
    return event => event !== null && event.state === state;
  }
  function noEventsLeft(event) {
    return event === null;
  }
  function trueFn() {
    return true;
  }
  function fillEventsForCurrentState({
    shouldConsumeEvent = trueFn,
    shouldTransitionToNextState = trueFn
  }) {
    function peekCurrentEvent() {
      return _events[0] ?? null;
    }
    function peekNextEvent() {
      return _events[1] ?? null;
    }
    function consumeCurrentEvent() {
      _events.shift();
    }
    const currentEvent = peekCurrentEvent();
    const nextEvent = peekNextEvent();
    const currentRequiredState = REQUIRED_EVENTS[currentStateIdx];
    let eventData = {};
    const shouldUseEvent = shouldConsumeEvent(currentEvent);
    if (shouldUseEvent) {
      eventData = currentEvent;
      consumeCurrentEvent();
    }
    transformedEvents.push({
      state: currentRequiredState,
      ...eventData
    });
    if (shouldTransitionToNextState(nextEvent)) {
      currentStateIdx++;
    }
  }
  const REQUIRED_EVENTS = [State.BEGAN, State.ACTIVE, State.END];
  let currentStateIdx = 0;
  const transformedEvents = [];
  let hasAllStates;
  let iterations = 0;
  do {
    const nextRequiredState = REQUIRED_EVENTS[currentStateIdx];
    if (nextRequiredState === State.BEGAN) {
      fillEventsForCurrentState({
        shouldConsumeEvent: e => isWithoutState(e) || hasState(State.BEGAN)(e)
      });
    } else if (nextRequiredState === State.ACTIVE) {
      const shouldConsumeEvent = e => isWithoutState(e) || hasState(State.ACTIVE)(e);
      const shouldTransitionToNextState = nextEvent => noEventsLeft(nextEvent) || hasState(State.END)(nextEvent) || hasState(State.FAILED)(nextEvent) || hasState(State.CANCELLED)(nextEvent);
      fillEventsForCurrentState({
        shouldConsumeEvent,
        shouldTransitionToNextState
      });
    } else if (nextRequiredState === State.END) {
      fillEventsForCurrentState({});
    }
    hasAllStates = currentStateIdx === REQUIRED_EVENTS.length;
    invariant(iterations++ <= 500, 'exceeded max number of iterations, please report a bug in RNGH repository with your test case');
  } while (!hasAllStates);
  return transformedEvents;
}
function getHandlerData(componentOrGesture) {
  if (isGesture(componentOrGesture)) {
    const gesture = componentOrGesture;
    return {
      emitEvent: (eventName, args) => {
        DeviceEventEmitter.emit(eventName, args.nativeEvent);
      },
      handlerType: gesture.handlerName,
      handlerTag: gesture.handlerTag,
      enabled: gesture.config.enabled
    };
  }
  if (isHookGesture(componentOrGesture)) {
    return {
      handlerType: componentOrGesture.type,
      handlerTag: componentOrGesture.handlerTag,
      enabled: maybeUnpackValue(componentOrGesture.config.enabled),
      emitEvent: (eventName, args) => {
        const {
          state,
          oldState,
          handlerTag,
          ...rest
        } = args.nativeEvent;
        const event = {
          state,
          handlerTag,
          handlerData: {
            ...rest
          }
        };
        if (eventName === 'onGestureHandlerStateChange') {
          componentOrGesture.detectorCallbacks.jsEventHandler?.({
            oldState: oldState,
            ...event
          });
        } else if (eventName === 'onGestureHandlerEvent') {
          componentOrGesture.detectorCallbacks.jsEventHandler?.(event);
        }
      }
    };
  }
  const gestureHandlerComponent = componentOrGesture;
  return {
    emitEvent: (eventName, args) => {
      fireEvent(gestureHandlerComponent, eventName, args);
    },
    handlerType: gestureHandlerComponent.props.handlerType,
    handlerTag: gestureHandlerComponent.props.handlerTag,
    enabled: gestureHandlerComponent.props.enabled
  };
}

// prettier-ignore

const FORBIDDEN_CONTROLLER_EVENT_FIELDS = ['handlerTag', 'nativeEvent', 'oldState', 'state'];
const FINISHED_CONTROLLER_STATES = [State.END, State.FAILED, State.CANCELLED];
function getStateName(state) {
  return Object.entries(State).find(([, value]) => value === state)?.[0] ?? String(state);
}
function validateControllerEvent(event) {
  for (const field of FORBIDDEN_CONTROLLER_EVENT_FIELDS) {
    invariant(!hasProperty(event, field), `GestureController manages '${field}' internally. Pass only gesture event payload fields.`);
  }
}
function resolveGestureControllerTarget(target) {
  if (typeof target === 'string') {
    return getByGestureTestId(target);
  }
  if (isGesture(target)) {
    return target;
  }
  if (isHookGesture(target)) {
    return findGesture(target.handlerTag) ?? target;
  }
  return target;
}
class GestureControllerImpl {
  state = State.UNDETERMINED;

  // eslint-disable-next-line no-useless-constructor
  constructor(resolveHandlerData) {
    this.resolveHandlerData = resolveHandlerData;
  }
  begin(event = {}) {
    const handlerData = this.resolveHandlerData();
    if (!this.isEnabled(handlerData)) {
      return;
    }
    this.resetIfFinished();
    this.transition('begin', State.BEGAN, [State.UNDETERMINED], event, handlerData);
  }
  activate(event = {}) {
    const handlerData = this.resolveHandlerData();
    if (!this.isEnabled(handlerData)) {
      return;
    }
    this.transition('activate', State.ACTIVE, [State.BEGAN], event, handlerData);
  }
  update(event = {}) {
    const handlerData = this.resolveHandlerData();
    if (!this.isEnabled(handlerData)) {
      return;
    }
    this.assertCurrentState('update', [State.ACTIVE]);
    const nativeEvent = this.buildEvent(State.ACTIVE, event, handlerData);
    handlerData.emitEvent('onGestureHandlerEvent', wrapWithNativeEvent(nativeEvent));
  }
  end(event = {}) {
    const handlerData = this.resolveHandlerData();
    if (!this.isEnabled(handlerData)) {
      return;
    }
    this.transition('end', State.END, [State.BEGAN, State.ACTIVE], event, handlerData);
  }
  fail(event = {}) {
    const handlerData = this.resolveHandlerData();
    if (!this.isEnabled(handlerData)) {
      return;
    }
    this.transition('fail', State.FAILED, [State.BEGAN, State.ACTIVE], event, handlerData);
  }
  cancel(event = {}) {
    const handlerData = this.resolveHandlerData();
    if (!this.isEnabled(handlerData)) {
      return;
    }
    this.transition('cancel', State.CANCELLED, [State.BEGAN, State.ACTIVE], event, handlerData);
  }
  transition(action, nextState, allowedStates, event, handlerData) {
    this.assertCurrentState(action, allowedStates);
    const oldState = this.state;
    const nativeEvent = {
      oldState,
      ...this.buildEvent(nextState, event, handlerData)
    };
    this.state = nextState;
    handlerData.emitEvent('onGestureHandlerStateChange', wrapWithNativeEvent(nativeEvent));
  }
  isEnabled(handlerData) {
    return handlerData.enabled !== false;
  }
  resetIfFinished() {
    if (FINISHED_CONTROLLER_STATES.includes(this.state)) {
      this.state = State.UNDETERMINED;
    }
  }
  assertCurrentState(action, allowedStates) {
    invariant(allowedStates.includes(this.state), `Cannot ${action} gesture from ${getStateName(this.state)} state.`);
  }
  buildEvent(state, event, handlerData) {
    validateControllerEvent(event);
    return fillMissingDefaultsFor(handlerData)({
      ...event,
      state
    });
  }
}
export function createGestureController(componentOrGesture) {
  return new GestureControllerImpl(() => getHandlerData(resolveGestureControllerTarget(componentOrGesture)));
}
export function fireGestureHandler(componentOrGesture, eventList = []) {
  const {
    emitEvent,
    handlerType,
    handlerTag,
    enabled
  } = getHandlerData(componentOrGesture);
  if (enabled === false) {
    return;
  }
  let _ = fillMissingStatesTransitions(eventList, isDiscreteHandler(handlerType));
  _ = _.map(fillMissingDefaultsFor({
    handlerTag,
    handlerType
  }));
  _ = withPrevAndCurrent(_, fillOldStateChanges);
  _ = withPrevAndCurrent(_, validateStateTransitions);
  const events = _.map(event => wrapWithNativeEvent(event));
  const [firstEvent, ...restEvents] = events;
  emitEvent('onGestureHandlerStateChange', firstEvent);
  let lastSentEvent = firstEvent;
  for (const event of restEvents) {
    const hasChangedState = lastSentEvent.nativeEvent.state !== event.nativeEvent.state;
    if (hasChangedState) {
      emitEvent('onGestureHandlerStateChange', event);
    } else {
      emitEvent('onGestureHandlerEvent', event);
    }
    lastSentEvent = event;
  }
}
export function getByGestureTestId(testID) {
  const handler = findHandlerByTestID(testID);
  if (handler === null) {
    throw new Error(`Handler with id: '${testID}' cannot be found`);
  }
  return handler;
}
//# sourceMappingURL=jestUtils.js.map