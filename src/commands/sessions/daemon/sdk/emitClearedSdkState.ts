import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";

export function emitClearedSdkState(emit: (event: SdkSessionEvent) => void) {
	emit({ kind: "activity", text: null });
	emit({ kind: "elapsed", seconds: null });
	emit({ kind: "process", process: null });
	emit({ kind: "queued", texts: [] });
	emit({ kind: "background", tasks: [] });
	emit({ kind: "interrupting", pending: false });
}
