import Box from "@mui/material/Box";
import type { RuleScope } from "../../../../../rules/types";
import type { RuleActions } from "./RuleActions";
import { RuleChangeReviewPane } from "./RuleChangeReviewPane";
import { RuleScopeNav } from "./RuleScopeNav";
import { RuleScopePanel } from "./RuleScopePanel";
import { rulesGridSx } from "./rulesGridSx";
import type { RuleChangeDecision } from "./useRuleChanges";

type Props = {
	selected: RuleScope | undefined;
	onSelect: (id: string) => void;
	isInEffect: (scope: RuleScope) => boolean;
	actions: RuleActions;
	onDecide: (id: string, decision: RuleChangeDecision) => Promise<unknown>;
};

export function RulesGrid({
	selected,
	onSelect,
	isInEffect,
	actions,
	onDecide,
}: Props) {
	const { scopes, changes } = actions;
	const reviewing = changes.length > 0;
	return (
		<Box sx={rulesGridSx(reviewing)}>
			<RuleScopeNav
				scopes={scopes}
				selectedId={selected?.id}
				onSelect={onSelect}
				isInEffect={isInEffect}
			/>
			{selected && <RuleScopePanel scope={selected} actions={actions} />}
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
