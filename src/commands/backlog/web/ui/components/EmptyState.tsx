import { Box } from "@mui/material";
import type { TypeFilterValue } from "./TypeFilter";

const typeNoun: Record<TypeFilterValue, string> = {
	all: "items",
	story: "stories",
	bug: "bugs",
};

const emptySx = {
	textAlign: "center",
	color: "text.disabled",
	py: 6,
	px: 2,
} as const;

export function EmptyState({
	query,
	typeFilter,
}: {
	query: string;
	typeFilter: TypeFilterValue;
}) {
	const noun = typeNoun[typeFilter];
	const message = query.trim()
		? `No ${noun} match your search.`
		: `No ${noun} in the backlog.`;
	return <Box sx={emptySx}>{message}</Box>;
}
