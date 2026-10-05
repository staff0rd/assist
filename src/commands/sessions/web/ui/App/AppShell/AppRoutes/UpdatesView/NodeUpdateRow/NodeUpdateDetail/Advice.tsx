import type { NodeUpdateEntry } from "../../../../NodeUpdateEntry";
import type { UpdateState } from "../../UpdateStateKind";
import type { UpdateActions } from "../../useUpdateActions";
import { DivergedAdvice } from "./Advice/DivergedAdvice";
import { ReadyAdvice } from "./Advice/ReadyAdvice";

export function Advice({
	entry,
	state,
	actions,
}: {
	entry: NodeUpdateEntry;
	state: UpdateState;
	actions: UpdateActions;
}) {
	const status = entry.status;
	if (!status) return null;
	if (state.kind === "ready")
		return <ReadyAdvice entry={entry} status={status} actions={actions} />;
	if (state.kind === "diverged")
		return <DivergedAdvice entry={entry} actions={actions} />;
	return null;
}
