import React from 'react';
import { TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Icon } from './Icon';
import { IconPlayerPause, IconPlayerPlay } from 'tabler-icons-react-native';

interface SwipeableRowProps {
  children: React.ReactNode;
  isActive: boolean;
  onToggleActive: () => void;
}

export const SwipeableRow = ({ children, isActive = true, onToggleActive }: SwipeableRowProps) => {
  const swipeRef = React.useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={{
        width: 88,
        backgroundColor: isActive ? '#F59E0B' : '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={() => {
        swipeRef.current?.close();
        onToggleActive();
      }}
      activeOpacity={0.85}
    >
      <Icon name={isActive ? IconPlayerPause : IconPlayerPlay} size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={1.5}
      rightThreshold={40}
    >
      {children}
    </Swipeable>
  );
};