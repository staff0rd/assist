import type { ScopedRule } from "../../../../../../../../rules/types";
import { formatBlockquoteComment } from "../../../../formatBlockquoteComment";
import { pasteAndSubmit } from "../../../../../../../shared/pasteAndSubmit";
import { ruleCitationNote } from "../../../../ruleCitationNote";

export function previewRuleCiter(
	sessionId: string | undefined,
	sendInput: ((sessionId: string, data: string) => void) | undefined,
	quote: string | undefined,
	onSent: () => void,
): ((rule: ScopedRule) => void) | undefined {
	if (!sessionId || !sendInput) return undefined;

	return (rule) => {
		if (quote !== undefined)
			pasteAndSubmit(
				sendInput,
				sessionId,
				formatBlockquoteComment(quote, ruleCitationNote(rule)),
			);
		onSent();
	};
}
