import type { SdkProcessInfo } from "../../../shared/harnessAdapters/types";
import type { SdkShellRow } from "./SdkShellRow";

export type SdkViewState = {
	sdkActivity?: string;
	sdkActivityElapsed?: number;
	sdkProcess?: SdkProcessInfo;
	sdkQueued?: string[];
	sdkPending?: string[];
	sdkShell?: SdkShellRow[];
	sdkBackgroundTasks?: string[];
	sdkPromptSuggestion?: string;
	sdkInterrupting?: boolean;
	sdkResuming?: boolean;
};
