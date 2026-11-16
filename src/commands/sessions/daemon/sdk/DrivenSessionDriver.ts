import type { HarnessKind } from "../../../../shared/harnesses";
import type { DrivenSessionOpts } from "../../../../shared/harnessAdapters/types";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { DrivenTurnEvent } from "./DrivenTurnEvent";

type DrivenQuery = {
	events: AsyncIterable<DrivenTurnEvent>;
	interrupt: () => Promise<void>;
	stopTask?: (taskId: string) => Promise<void>;
};

export type DrivenSessionContext = {
	opts: DrivenSessionOpts;
	label: string;
	abort: AbortController;
	control: SdkSessionControl;
	input: AsyncIterable<string>;
	childEnv: (
		base: Record<string, string | undefined>,
	) => Record<string, string>;
};

export type DrivenSessionDriver = {
	harness: HarnessKind;
	start: (context: DrivenSessionContext) => DrivenQuery;
};
