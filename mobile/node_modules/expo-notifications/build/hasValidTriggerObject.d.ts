export declare function hasValidTriggerObject(trigger: unknown): trigger is (object & Record<"type", unknown>) | (object & Record<"channelId", unknown>) | null;
