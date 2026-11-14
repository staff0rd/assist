import { type ReactNode, useState } from "react";
import { AssistPopover } from "../sendToAssist/AssistPopover";
import type { AssistSendResult } from "../sendToAssist/isAssistSendMessage";

type Send = (prompt: string) => Promise<AssistSendResult>;
type Dismiss = (restoreFocus: boolean) => void;
type Options = {
	selectedText?: string;
	prompt?: string;
	onPromptChange?: (prompt: string) => void;
};

function DocsFeedbackPopover({
	send,
	dismiss,
	selectedText,
	prompt,
	onPromptChange,
}: Options & { send: Send; dismiss: Dismiss }) {
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string>();

	const onSend = async (prompt: string) => {
		if (!prompt.trim()) return;
		setBusy(true);
		const result = await send(prompt);
		setBusy(false);
		if (result.ok) dismiss(false);
		else setError(result.message);
	};

	return (
		<AssistPopover
			placeholder="Feedback on the selected text"
			onSend={onSend}
			onClose={dismiss}
			error={error}
			busy={busy}
			keepDraftOnBlur
			copyWhenEmpty={selectedText}
			initialInstructions={prompt}
			onInstructionsChange={onPromptChange}
		/>
	);
}

export function docsFeedbackPopover(
	send: Send,
	dismiss: Dismiss,
	options: Options = {},
): ReactNode {
	return <DocsFeedbackPopover send={send} dismiss={dismiss} {...options} />;
}
