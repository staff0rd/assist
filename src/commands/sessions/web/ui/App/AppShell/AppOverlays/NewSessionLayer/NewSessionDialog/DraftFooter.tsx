import type { MouseEvent } from "react";
import type { NewSessionDraft } from "../useNewSessionDraft";
import { NewSessionFooter } from "./NewSessionFooter";
import { useSubmitLabel } from "./useSubmitLabel";

export function DraftFooter({
	draft,
	targetKind,
	onClick,
}: {
	draft: NewSessionDraft;
	targetKind: string;
	onClick: (e: MouseEvent) => void;
}) {
	return (
		<NewSessionFooter
			submitLabel={useSubmitLabel(targetKind, draft.mode)}
			onClick={onClick}
			disabled={targetKind === "blocked"}
			loading={draft.modePending}
		/>
	);
}
