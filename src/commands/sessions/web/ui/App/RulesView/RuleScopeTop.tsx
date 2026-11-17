import { useState } from "react";
import type { RuleScope } from "../../../../../rules/types";
import { addRuleFlag } from "./addRuleFlag";
import { RuleAddComposer } from "./RuleAddComposer";
import { RuleScopeHeader } from "./RuleScopeHeader";
import type { RuleComments } from "./useRuleComments";

type Props = { scope: RuleScope; comments: RuleComments };

export function RuleScopeTop({ scope, comments }: Props) {
	const [addingTo, setAddingTo] = useState<string>();
	const adding = addingTo === scope.id;
	const flag = addRuleFlag(scope);
	const { onAddRule, sessionName } = comments;
	const close = () => setAddingTo(undefined);

	return (
		<>
			<RuleScopeHeader
				scope={scope}
				adding={adding}
				onAdd={() => setAddingTo(scope.id)}
			/>
			{adding && (
				<RuleAddComposer
					scope={scope}
					sessionName={sessionName}
					onSend={
						onAddRule
							? (note) => {
									onAddRule(flag, note);
									close();
								}
							: undefined
					}
					onCancel={close}
				/>
			)}
		</>
	);
}
