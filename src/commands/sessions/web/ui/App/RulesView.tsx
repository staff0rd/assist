import Box from "@mui/material/Box";
import { useState } from "react";
import { PageShell } from "./PageShell";
import { RuleScopeNav } from "./RulesView/RuleScopeNav";
import { RuleScopePanel } from "./RulesView/RuleScopePanel";
import { useRuleScopes } from "./RulesView/useRuleScopes";
import { useRepoSelectionContext } from "../useRepoSelectionContext";
import { RulesHeader } from "./RulesView/RulesHeader";

const pageSx = { maxWidth: { lg: 1120 } } as const;

export function RulesView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { scopes, loading, error } = useRuleScopes(selectedCwd);
	const [selectedId, setSelectedId] = useState<string>();
	const selected = scopes.find((scope) => scope.id === selectedId) ?? scopes[0];

	return (
		<PageShell
			loading={loading}
			header={<RulesHeader cwd={selectedCwd} />}
			isEmpty={scopes.length === 0}
			emptyMessage={error ?? "No rule scopes found."}
			maxWidth="lg"
			sx={pageSx}
		>
			<Box
				sx={(t) => ({
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						md: `${t.spacing(35)} minmax(0, 1fr)`,
					},
					gap: 2,
					alignItems: "start",
				})}
			>
				<RuleScopeNav
					scopes={scopes}
					selectedId={selected?.id}
					onSelect={setSelectedId}
				/>
				{selected && <RuleScopePanel scope={selected} />}
			</Box>
		</PageShell>
	);
}
