import type { NotificationChannelGroup, NotificationChannelGroupInput } from './NotificationChannelGroupManager.types';
export declare function setNotificationChannelGroupAsync(groupId: string, group: NotificationChannelGroupInput): Promise<NotificationChannelGroup | null>;
