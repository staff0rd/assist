import type { LinkRef } from "./LinkState";

const ITEM_FIELDS =
	"__typename ... on Issue { state stateReason } ... on PullRequest { state isDraft }";

export function linkStatusQuery(refs: LinkRef[]): {
	query: string;
	variables: Record<string, string | number>;
} {
	const params: string[] = [];
	const fields: string[] = [];
	const variables: Record<string, string | number> = {};
	refs.forEach((ref, i) => {
		params.push(`$o${i}: String!, $r${i}: String!, $n${i}: Int!`);
		fields.push(
			`i${i}: repository(owner: $o${i}, name: $r${i}) { issueOrPullRequest(number: $n${i}) { ${ITEM_FIELDS} } }`,
		);
		variables[`o${i}`] = ref.owner;
		variables[`r${i}`] = ref.repo;
		variables[`n${i}`] = ref.number;
	});
	return {
		query: `query(${params.join(", ")}) { ${fields.join(" ")} }`,
		variables,
	};
}
