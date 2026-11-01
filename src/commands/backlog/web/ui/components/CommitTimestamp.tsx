import { Box } from "@mui/material";
import type { GitRef } from "../types";

const TIMESTAMPED_KINDS = new Set(["commit", "docs-unlock", "schema-unlock"]);

const timestampSx = {
	color: "text.disabled",
	ml: 1,
} as const;

export function CommitTimestamp({ gitRef }: { gitRef: GitRef }) {
	if (!TIMESTAMPED_KINDS.has(gitRef.kind) || !gitRef.createdAt) return null;
	return (
		<Box component="span" sx={timestampSx}>
			{formatTimestamp(gitRef.createdAt)}
		</Box>
	);
}

function formatTimestamp(ts: string): string {
	return new Date(ts).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
