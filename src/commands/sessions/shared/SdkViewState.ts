import type { SdkProcessInfo } from "../../../shared/harnessAdapters/types";

export type SdkViewState = {
	sdkActivity?: string;
	sdkActivityElapsed?: number;
	sdkProcess?: SdkProcessInfo;
	sdkQueued?: string[];
	sdkPending?: string[];
	sdkBackgroundTasks?: string[];
	sdkPromptSuggestion?: string;
	sdkInterrupting?: boolean;
	sdkResuming?: boolean;
};
