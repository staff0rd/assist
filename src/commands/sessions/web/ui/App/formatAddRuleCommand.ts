import { formatBlockquoteComment } from "./formatBlockquoteComment";
import { formatQuotedComment } from "./formatQuotedComment";

export type AddRuleRequest = {
	path?: string | undefined;
	quote: string;
	note: string;
};

export function formatAddRuleCommand({
	path,
	quote,
	note,
}: AddRuleRequest): string {
	if (!path) return `/add-rule\n\n${formatBlockquoteComment(quote, note)}`;
	return `/add-rule\n\nFile: ${path}\n\n${formatQuotedComment(quote, note)}`;
}
