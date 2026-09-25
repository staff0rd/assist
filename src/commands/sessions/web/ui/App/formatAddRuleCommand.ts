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
	const file = path ? `File: ${path}\n\n` : "";
	return `/add-rule\n\n${file}${formatQuotedComment(quote, note)}`;
}
