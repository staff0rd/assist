import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Box, Collapse, ListItemButton, Typography } from "@mui/material";
import type { ScopedRule } from "../../../rules/types";
import type { RuleScope } from "./groupRulesByScope";
import { RuleCitationRow } from "./RuleCitationRow";

const headerSx = {
	gap: 0.5,
	alignItems: "center",
	borderRadius: 1,
	py: 0.25,
	px: 0.5,
} as const;

const sourceSx = {
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function RuleScopeGroup({
	scope,
	expanded,
	onToggle,
	onCite,
}: {
	scope: RuleScope;
	expanded: boolean;
	onToggle: () => void;
	onCite: (rule: ScopedRule) => void;
}) {
	const Chevron = expanded ? ExpandLess : ExpandMore;

	return (
		<Box>
			<ListItemButton dense sx={headerSx} onClick={onToggle}>
				<Chevron fontSize="small" color="disabled" />
				<Typography variant="caption" color="text.secondary" sx={sourceSx}>
					{scope.source}
				</Typography>
				<Typography variant="caption" color="text.disabled">
					{scope.rules.length}
				</Typography>
			</ListItemButton>
			<Collapse in={expanded} unmountOnExit>
				{scope.rules.map((rule) => (
					<RuleCitationRow
						key={rule.code}
						rule={rule}
						onCite={() => onCite(rule)}
					/>
				))}
			</Collapse>
		</Box>
	);
}
