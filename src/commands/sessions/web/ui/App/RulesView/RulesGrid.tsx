import Box from "@mui/material/Box";
import type {
	PendingRuleChange,
	RuleChange,
	RuleScope,
} from "../../../../../rules/types";
import { RuleChangeReviewPane } from "./RuleChangeReviewPane";
import { RuleScopeNav } from "./RuleScopeNav";
import { RuleScopePanel } from "./RuleScopePanel";
import { rulesGridSx } from "./rulesGridSx";
import type { RuleChangeDecision } from "./useRuleChanges";

type Props = {
	scopes: RuleScope[];
	selected: RuleScope | undefined;
	onSelect: (id: string) => void;
	isInEffect: (scope: RuleScope) => boolean;
	changes: PendingRuleChange[];
	onPropose: (change: RuleChange) => Promise<string | undefined>;
	onDecide: (id: string, decision: RuleChangeDecision) => Promise<unknown>;
};

export function RulesGrid({
	scopes,
	selected,
	onSelect,
	isInEffect,
	changes,
	onPropose,
	onDecide,
}: Props) {
	const reviewing = changes.length > 0;
	return (
		<Box sx={rulesGridSx(reviewing)}>
			<RuleScopeNav
				scopes={scopes}
				selectedId={selected?.id}
				onSelect={onSelect}
				isInEffect={isInEffect}
			/>
			{selected && (
				<RuleScopePanel
					scope={selected}
					scopes={scopes}
					changes={changes}
					onPropose={onPropose}
				/>
			)}
			{reviewing && (
				<RuleChangeReviewPane
					changes={changes}
					scopes={scopes}
					onDecide={onDecide}
				/>
			)}
		</Box>
	);
}
