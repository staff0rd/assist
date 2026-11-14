import { useState } from "react";
import type { SessionInfo } from "../types";
import { PageShell } from "./PageShell";
import { RulesGrid } from "./RulesView/RulesGrid";
import { RulesNotices } from "./RulesView/RulesNotices";
import { useRuleChangeFailure } from "./RulesView/useRuleChangeFailure";
import { useRuleChanges } from "./RulesView/useRuleChanges";
import { useRuleComments } from "./RulesView/useRuleComments";
import { useRuleScopes } from "./RulesView/useRuleScopes";
import { useRepoSelectionContext } from "../useRepoSelectionContext";
import { RulesHeader } from "./RulesView/RulesHeader";
import { scopeInEffect } from "./RulesView/scopeInEffect";

type Props = {
	sessions: SessionInfo[];
	cardId: string | null;
	sendInput: (sessionId: string, data: string) => void;
};

export function RulesView({ sessions, cardId, sendInput }: Props) {
	const { selectedCwd } = useRepoSelectionContext();
	const { scopes, loading, error, reload } = useRuleScopes(selectedCwd);
	const { changes, propose, decide } = useRuleChanges(selectedCwd, reload);
	const { failure, clearFailure, onDecide } = useRuleChangeFailure(decide);
	const comments = useRuleComments(selectedCwd, sessions, cardId, sendInput);
	const [selectedId, setSelectedId] = useState<string>();
	const [path, setPath] = useState("");
	const reviewing = changes.length > 0;

	return (
		<PageShell
			loading={loading}
			header={
				<RulesHeader cwd={selectedCwd} path={path} onPathChange={setPath} />
			}
			isEmpty={scopes.length === 0}
			emptyMessage={error ?? "No rule scopes found."}
			maxWidth={reviewing ? "xl" : "lg"}
			sx={{ maxWidth: { lg: reviewing ? 1480 : 1120 } }}
		>
			<RulesNotices
				failure={failure}
				onClearFailure={clearFailure}
				sentTo={comments.sentTo}
				onClearSent={comments.clearSent}
			/>
			<RulesGrid
				selected={scopes.find((scope) => scope.id === selectedId) ?? scopes[0]}
				onSelect={setSelectedId}
				isInEffect={(scope) => scopeInEffect(scope, path, selectedCwd)}
				actions={{ scopes, changes, onPropose: propose, comments }}
				onDecide={onDecide}
			/>
		</PageShell>
	);
}
