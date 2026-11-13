import type { ReactNode } from "react";
import { AssistReviewMenu } from "./AssistReviewMenu";
import { AssistSendModesPopover } from "./AssistSendModesPopover";
import type { AssistSendRequest } from "./isAssistSendMessage";

export type AssistPopoverKind =
	| "instructions"
	| "link"
	| "review"
	| "azure-devops-review";

export function assistPopoverContent(
	kind: AssistPopoverKind,
	{
		send,
		dismiss,
	}: {
		send: (request: AssistSendRequest) => void;
		dismiss: (restoreFocus: boolean) => void;
	},
): ReactNode {
	if (kind === "review" || kind === "azure-devops-review")
		return (
			<AssistReviewMenu
				actionsOnly={kind === "azure-devops-review"}
				onPick={(args) => {
					dismiss(false);
					send({ args });
				}}
				onPrompt={
					kind === "review"
						? (instructions) => {
								dismiss(false);
								send({ instructions: instructions || undefined });
							}
						: undefined
				}
				onClose={dismiss}
			/>
		);
	return (
		<AssistSendModesPopover
			pickRepo={kind === "link"}
			send={send}
			dismiss={dismiss}
		/>
	);
}
