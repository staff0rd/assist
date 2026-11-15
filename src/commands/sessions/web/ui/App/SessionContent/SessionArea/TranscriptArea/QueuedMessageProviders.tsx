import { type ReactNode, useMemo } from "react";
import {
	ComposerDraftContext,
	createComposerDraftRegistry,
} from "../SdkComposer/useComposerDraft";
import {
	RunShellCommandContext,
	type RunShellCommand,
} from "./useRunShellCommand";
import {
	StopShellCommandContext,
	type StopShellCommand,
} from "./useStopShellCommand";
import {
	DiscardShellResultContext,
	type DiscardShellResult,
} from "./useDiscardShellResult";
import {
	DequeueMessageContext,
	type DequeueMessage,
} from "./useDequeueMessage";

export function QueuedMessageProviders({
	dequeue,
	runShell,
	stopShell,
	discardShell,
	children,
}: {
	dequeue: DequeueMessage;
	runShell: RunShellCommand;
	stopShell: StopShellCommand;
	discardShell: DiscardShellResult;
	children: ReactNode;
}) {
	const drafts = useMemo(createComposerDraftRegistry, []);
	return (
		<DequeueMessageContext.Provider value={dequeue}>
			<ComposerDraftContext.Provider value={drafts}>
				<RunShellCommandContext.Provider value={runShell}>
					<StopShellCommandContext.Provider value={stopShell}>
						<DiscardShellResultContext.Provider value={discardShell}>
							{children}
						</DiscardShellResultContext.Provider>
					</StopShellCommandContext.Provider>
				</RunShellCommandContext.Provider>
			</ComposerDraftContext.Provider>
		</DequeueMessageContext.Provider>
	);
}
