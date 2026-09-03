import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import type { ScopedRule } from "../../../rules/types";
import { groupRulesByScope } from "./groupRulesByScope";
import { RuleScopeGroup } from "./RuleScopeGroup";

const listSx = { maxHeight: 220, overflow: "auto" } as const;

export function RuleCitationList({
	rules,
	onCite,
}: {
	rules: ScopedRule[];
	onCite: (rule: ScopedRule) => void;
}) {
	const scopes = useMemo(() => groupRulesByScope(rules), [rules]);
	const [toggled, setToggled] = useState<Record<string, boolean>>({});

	return (
		<Box>
			<Typography variant="caption" color="text.secondary">
				Cite a broken rule
			</Typography>
			<Box sx={listSx}>
				{scopes.map((scope, index) => (
					<RuleScopeGroup
						key={scope.source}
						scope={scope}
						expanded={toggled[scope.source] ?? index === 0}
						onToggle={() =>
							setToggled((current) => ({
								...current,
								[scope.source]: !(current[scope.source] ?? index === 0),
							}))
						}
						onCite={onCite}
					/>
				))}
			</Box>
		</Box>
	);
}
