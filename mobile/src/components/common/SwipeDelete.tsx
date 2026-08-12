import React from 'react';
import { TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Icon } from '../ui/Icon';
import { IconTrash } from 'tabler-icons-react-native';

interface SwipeDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export default function SwipeDelete({ children, onDelete }: SwipeDeleteProps) {
  return (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.button}
          onPress={onDelete}
          activeOpacity={0.85}
        >
          <Icon name={IconTrash} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      {children}
    </Swipeable>
  );
}

const styles = {
  button: {
    width: 80,
    backgroundColor: '#FF3B30',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};