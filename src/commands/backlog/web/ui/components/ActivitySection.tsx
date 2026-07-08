import { Box, Link, Stack, Typography } from "@mui/material";
import { groupActivityRefs } from "../../../groupActivityRefs";
import type { GitRef } from "../types";

const headingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

const kindSx = {
	color: "text.secondary",
	mr: 1,
	fontFamily: "monospace",
} as const;

function refLabel(ref: GitRef): string {
	if (ref.kind === "commit") {
		const subject = ref.title ? ` ${ref.title}` : "";
		return `${ref.ref.slice(0, 8)}${subject}`;
	}
	if (ref.kind === "pr") {
		const title = ref.title ? ` ${ref.title}` : "";
		const state = ref.state ? ` (${ref.state.toLowerCase()})` : "";
		return `#${ref.ref}${title}${state}`;
	}
	return ref.ref;
}

function RefRow({ gitRef }: { gitRef: GitRef }) {
	const label = refLabel(gitRef);
	return (
		<Typography variant="body2">
			<Box component="span" sx={kindSx}>
				{gitRef.kind}
			</Box>
			{gitRef.url ? (
				<Link
					href={gitRef.url}
					target="_blank"
					rel="noopener"
					onClick={(e) => e.stopPropagation()}
				>
					{label}
				</Link>
			) : (
				label
			)}
		</Typography>
	);
}

export function ActivitySection({ gitRefs }: { gitRefs: GitRef[] }) {
	const { branches, commits, prs, hiddenCommits } = groupActivityRefs(gitRefs);
	const ordered = [...branches, ...commits, ...prs];
	if (ordered.length === 0) return null;
	return (
		<Box sx={{ mb: 2 }}>
			<Typography variant="overline" sx={headingSx}>
				Activity
			</Typography>
			<Stack spacing={1}>
				{ordered.map((r) => (
					<RefRow key={`${r.kind}:${r.ref}`} gitRef={r} />
				))}
				{hiddenCommits > 0 && (
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						… and {hiddenCommits} more commits
					</Typography>
				)}
			</Stack>
		</Box>
	);
}
