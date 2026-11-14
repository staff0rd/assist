import { type ReactNode, useMemo } from "react";
import {
	ComposerDraftContext,
	createComposerDraftRegistry,
} from "../SdkComposer/useComposerDraft";
import {
	DequeueMessageContext,
	type DequeueMessage,
} from "./useDequeueMessage";

export function QueuedMessageProviders({
	dequeue,
	children,
}: {
	dequeue: DequeueMessage;
	children: ReactNode;
}) {
	const drafts = useMemo(createComposerDraftRegistry, []);
	return (
		<DequeueMessageContext.Provider value={dequeue}>
			<ComposerDraftContext.Provider value={drafts}>
				{children}
			</ComposerDraftContext.Provider>
		</DequeueMessageContext.Provider>
	);
}
