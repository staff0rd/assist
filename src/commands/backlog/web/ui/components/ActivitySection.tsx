import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { groupActivityRefs } from "../../../groupActivityRefs";
import type { Conversation, GitRef } from "../types";
import { CommitOverflowToggle } from "./CommitOverflowToggle";
import { ConversationRow } from "./ConversationRow";
import { itemSectionAnchor } from "./itemSectionAnchor";
import { sectionHeadingSx } from "./sectionHeadingSx";
import { RefRow } from "./RefRow";

export function ActivitySection({
	gitRefs,
	conversations = [],
}: {
	gitRefs: GitRef[];
	conversations?: Conversation[];
}) {
	const [expanded, setExpanded] = useState(false);
	const { docsUnlocks, branches, commits, overflowCommits, prs, slacks } =
		groupActivityRefs(gitRefs);
	const ordered = [
		...docsUnlocks,
		...branches,
		...commits,
		...(expanded ? overflowCommits : []),
		...prs,
		...slacks,
	];
	if (ordered.length === 0 && conversations.length === 0) return null;
	return (
		<Box {...itemSectionAnchor("activity")}>
			<Typography variant="overline" sx={sectionHeadingSx}>
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
