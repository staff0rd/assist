import { useSyncExternalStore } from "react";
import { inboxStore } from "./inboxStore";
import type { InboxStatus } from "./types";

export function useInboxStatus(): InboxStatus | undefined {
	return useSyncExternalStore(inboxStore.subscribe, inboxStore.getStatus);
}
