import type { NotificationChannel } from './NotificationChannelManager.types';
export declare function getNotificationChannelAsync(channelId: string): Promise<NotificationChannel | null>;
