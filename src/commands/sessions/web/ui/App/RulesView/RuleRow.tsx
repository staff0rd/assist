import Box from "@mui/material/Box";
import { useState } from "react";
import type {
	PendingRuleChange,
	RuleChange,
	RuleEntry,
	RuleScope,
} from "../../../../../rules/types";
import { RuleCode } from "./RuleCode";
import { RuleRowActions } from "./RuleRowActions";
import { RuleRowForm } from "./RuleRowForm";
import { RuleRowText } from "./RuleRowText";
import { ruleRowSx } from "./ruleRowSx";

type Props = {
	rule: RuleEntry;
	scope: RuleScope;
	scopes: RuleScope[];
	pending: PendingRuleChange | undefined;
	onPropose: (change: RuleChange) => Promise<string | undefined>;
};

const ACTIONS = "rule-actions";

export function RuleRow({ rule, scope, scopes, pending, onPropose }: Props) {
	const [mode, setMode] = useState<"edit" | "delete">();
	const label = rule.title ?? rule.code ?? rule.text;
	const close = () => setMode(undefined);
	const propose = async (change: RuleChange) => {
		const failure = await onPropose(change);
		if (!failure) close();
		return failure;
	};

	return (
		<Box component="li" sx={ruleRowSx(ACTIONS, !!mode)}>
			<RuleCode code={rule.code} />
			<RuleRowText rule={rule} pending={pending} />
			<RuleRowActions
				className={ACTIONS}
				label={label}
				disabled={!!pending}
				onEdit={() => setMode("edit")}
				onDelete={() => setMode("delete")}
			/>
			<RuleRowForm
				mode={mode}
				label={label}
				rule={rule}
				scope={scope}
				scopes={scopes}
				onPropose={propose}
				onClose={close}
			/>
		</Box>
	);
}
