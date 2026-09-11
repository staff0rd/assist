import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { groupActivityRefs } from "../../../groupActivityRefs";
import type { Conversation, GitRef } from "../types";
import { CommitOverflowToggle } from "./CommitOverflowToggle";
import { ConversationRow } from "./ConversationRow";
import { itemSectionAnchor } from "./itemSectionAnchor";
import { RefRow } from "./RefRow";

const headingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

export function ActivitySection({
	gitRefs,
	conversations = [],
}: {
	gitRefs: GitRef[];
	conversations?: Conversation[];
}) {
	const [expanded, setExpanded] = useState(false);
	const { branches, commits, overflowCommits, prs, slacks } =
		groupActivityRefs(gitRefs);
	const ordered = [
		...branches,
		...commits,
		...(expanded ? overflowCommits : []),
		...prs,
		...slacks,
	];
	if (ordered.length === 0 && conversations.length === 0) return null;
	return (
		<Box {...itemSectionAnchor("activity")}>
			<Typography variant="overline" sx={headingSx}>
				Activity
			</Typography>
			<Stack spacing={1}>
				{ordered.map((r) => (
					<RefRow key={`${r.kind}:${r.ref}`} gitRef={r} />
				))}
				{conversations.map((c) => (
					<ConversationRow key={c.sessionId} conversation={c} />
				))}
				<CommitOverflowToggle
					hiddenCount={overflowCommits.length}
					expanded={expanded}
					onToggle={() => setExpanded((prev) => !prev)}
				/>
			</Stack>
		</Box>
	);
}
