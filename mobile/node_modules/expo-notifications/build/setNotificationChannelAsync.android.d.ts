import type { NotificationChannelInput, NotificationChannel } from './NotificationChannelManager.types';
export declare function setNotificationChannelAsync(channelId: string, channel: NotificationChannelInput): Promise<NotificationChannel | null>;
