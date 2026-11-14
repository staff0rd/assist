import type {
	SdkSessionEvent,
	SessionProcess,
} from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import { emitClearedSdkState } from "./emitClearedSdkState";
import { relaySdkActions } from "./relaySdkActions";

type SdkHandle = NonNullable<SessionProcess["sdk"]>;

export function createSdkRelay(label: string) {
	const listeners: ((event: SdkSessionEvent) => void)[] = [];
	let current: SessionProcess | undefined;
	let prefixer: (() => string) | undefined;
	const emit = (event: SdkSessionEvent) => {
		for (const listener of listeners) listener(event);
	};
	const detach = (query: SessionProcess) => {
		if (current !== query) return;
		current = undefined;
		daemonLog(`${label} sdk query detached from workflow`);
		emitClearedSdkState(emit);
	};
	const handle: SdkHandle = {
		onEvent: (listener) => listeners.push(listener),
		...relaySdkActions(label, () => current),
		setPrefix: (provider) => {
			prefixer = provider;
			current?.sdk?.setPrefix?.(provider);
		},
		attach: (query, idle) => {
			current = query;
			if (prefixer) query.sdk?.setPrefix?.(prefixer);
			daemonLog(
				`${label} sdk query attached to workflow${idle ? ", awaiting input" : ""}`,
			);
			query.sdk?.onEvent((event) => {
				if (current === query) emit(event);
			});
			query.onExit(() => detach(query));
			if (idle) emit({ kind: "status", status: "waiting" });
		},
	};
	return { handle, current: () => current };
}
