import type {
	PendingRuleChange,
	RuleChange,
	RuleScope,
} from "../../../../../rules/types";
import type { RuleComments } from "./useRuleComments";

export type RuleActions = {
	scopes: RuleScope[];
	changes: PendingRuleChange[];
	onPropose: (change: RuleChange) => Promise<string | undefined>;
	comments: RuleComments;
};
