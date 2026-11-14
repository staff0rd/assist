import Box from "@mui/material/Box";
import { useState } from "react";
import type {
	RuleChange,
	RuleEntry,
	RuleScope,
} from "../../../../../rules/types";
import { pendingChangeFor } from "./pendingChangeFor";
import type { RuleActions } from "./RuleActions";
import { RuleCode } from "./RuleCode";
import { RuleCommentLayer } from "./RuleCommentLayer";
import { RuleRowActions } from "./RuleRowActions";
import { RuleRowForm, type RuleRowMode } from "./RuleRowForm";
import { RuleRowText } from "./RuleRowText";
import { ruleRowSx } from "./ruleRowSx";

type Props = {
	rule: RuleEntry;
	scope: RuleScope;
	actions: RuleActions;
};

const ACTIONS = "rule-actions";

export function RuleRow({ rule, scope, actions }: Props) {
	const [mode, setMode] = useState<RuleRowMode>();
	const pending = pendingChangeFor(actions.changes, scope.id, rule);
	const label = rule.title ?? rule.code ?? rule.text;
	const close = () => setMode(undefined);
	const propose = async (change: RuleChange) => {
		const failure = await actions.onPropose(change);
		if (!failure) close();
		return failure;
	};

	return (
		<Box component="li" sx={ruleRowSx(ACTIONS, !!mode)}>
			<RuleCode code={rule.code} />
			<RuleCommentLayer rule={rule} scope={scope} comments={actions.comments}>
				<RuleRowText rule={rule} pending={pending} />
			</RuleCommentLayer>
			<RuleRowActions
				className={ACTIONS}
				label={label}
				pending={!!pending}
				onOpen={setMode}
			/>
			<RuleRowForm
				mode={mode}
				label={label}
				rule={rule}
				scope={scope}
				scopes={actions.scopes}
				onPropose={propose}
				onClose={close}
			/>
		</Box>
	);
}
