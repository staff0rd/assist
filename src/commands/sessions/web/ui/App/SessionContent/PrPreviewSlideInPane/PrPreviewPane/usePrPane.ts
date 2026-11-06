import { criteriaPaneActions } from "./usePrPane/criteriaPaneActions";
import type { PrPaneOptions } from "./PrPaneOptions";
import { usePaneComments } from "./usePrPane/usePaneComments";
import { usePaneScreenshots } from "./usePrPane/usePaneScreenshots";
import { usePrDecision } from "./usePrPane/usePrDecision";
import { useEditableBody } from "./usePrPane/useEditableBody";

export function usePrPane(options: PrPaneOptions) {
	const { requestId, sessionId, onDecision, isPr, chainDefaults } = options;
	const edit = useEditableBody(options.initialBody, options.editable);
	const comments = usePaneComments(
		requestId,
		options.supersedes,
		edit.collapse,
	);
	const { decision: shotsForDecision, ...shots } = usePaneScreenshots(options);
	const decision = usePrDecision(
		requestId,
		sessionId,
		onDecision,
		isPr,
		chainDefaults,
		shotsForDecision,
		edit.editedBody,
	);

	return {
		body: edit.body,
		...criteriaPaneActions(edit),
		...comments,
		onDecide: decision.onDecide,
		chain: decision.chain,
		setChain: decision.setChain,
		...shots,
	};
}
