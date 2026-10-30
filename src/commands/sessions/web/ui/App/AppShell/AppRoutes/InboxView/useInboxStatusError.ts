import { useSyncExternalStore } from "react";
import { inboxStore } from "./inboxStore";

export function useInboxStatusError(): string | undefined {
	return useSyncExternalStore(inboxStore.subscribe, inboxStore.getStatusError);
}
