import Alert from "@mui/material/Alert";
import { useState } from "react";
import { PageShell } from "./PageShell";
import { RulesGrid } from "./RulesView/RulesGrid";
import { useRuleChangeFailure } from "./RulesView/useRuleChangeFailure";
import { useRuleChanges } from "./RulesView/useRuleChanges";
import { useRuleScopes } from "./RulesView/useRuleScopes";
import { useRepoSelectionContext } from "../useRepoSelectionContext";
import { RulesHeader } from "./RulesView/RulesHeader";
import { scopeInEffect } from "./RulesView/scopeInEffect";

export function RulesView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { scopes, loading, error, reload } = useRuleScopes(selectedCwd);
	const { changes, propose, decide } = useRuleChanges(selectedCwd, reload);
	const { failure, clearFailure, onDecide } = useRuleChangeFailure(decide);
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
			{failure && (
				<Alert severity="error" onClose={clearFailure} sx={{ mb: 2 }}>
					{failure}
				</Alert>
			)}
			<RulesGrid
				scopes={scopes}
				selected={scopes.find((scope) => scope.id === selectedId) ?? scopes[0]}
				onSelect={setSelectedId}
				isInEffect={(scope) => scopeInEffect(scope, path, selectedCwd)}
				changes={changes}
				onPropose={propose}
				onDecide={onDecide}
			/>
		</PageShell>
	);
}
