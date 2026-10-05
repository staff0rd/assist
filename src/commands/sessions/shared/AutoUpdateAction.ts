export const AUTO_UPDATE_ACTIONS = ["pause", "resume", "check"] as const;

export type AutoUpdateAction = (typeof AUTO_UPDATE_ACTIONS)[number];
