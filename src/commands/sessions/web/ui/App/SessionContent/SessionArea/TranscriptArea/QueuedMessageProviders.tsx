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
	DequeueMessageContext,
	type DequeueMessage,
} from "./useDequeueMessage";

export function QueuedMessageProviders({
	dequeue,
	runShell,
	children,
}: {
	dequeue: DequeueMessage;
	runShell: RunShellCommand;
	children: ReactNode;
}) {
	const drafts = useMemo(createComposerDraftRegistry, []);
	return (
		<DequeueMessageContext.Provider value={dequeue}>
			<ComposerDraftContext.Provider value={drafts}>
				<RunShellCommandContext.Provider value={runShell}>
					{children}
				</RunShellCommandContext.Provider>
			</ComposerDraftContext.Provider>
		</DequeueMessageContext.Provider>
	);
}
