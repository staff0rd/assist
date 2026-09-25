import { formatAddRuleCommand } from "../../../formatAddRuleCommand";
import { pasteAndSubmit } from "../../../pasteAndSubmit";

export function previewRuleAdder(
	sessionId: string | undefined,
	sendInput: ((sessionId: string, data: string) => void) | undefined,
	quote: string | undefined,
	onSent: () => void,
): ((note: string) => void) | undefined {
	if (!sessionId || !sendInput) return undefined;

	return (note) => {
		if (quote !== undefined)
			pasteAndSubmit(
				sendInput,
				sessionId,
				formatAddRuleCommand({ quote, note }),
			);
		onSent();
	};
}
