import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import type { ReleaseCommit } from "../releases/types";

const SHORT_SHA = 7;

const linkSx = { fontFamily: "monospace" } as const;

const subjectSx = { mt: 0.5 } as const;

const authorSx = { opacity: 0.75, fontFamily: "monospace" } as const;

export function ReleaseCommitLink({
	repo,
	commit,
	note,
}: {
	repo: string;
	commit: ReleaseCommit;
	note: string;
}) {
	return (
		<Tooltip
			title={
				<>
					<Box>{note}</Box>
					{commit.subject && <Box sx={subjectSx}>{commit.subject}</Box>}
					{commit.author && <Box sx={authorSx}>{commit.author}</Box>}
				</>
			}
		>
			<Link
				sx={linkSx}
				href={`https://github.com/${repo}/commit/${commit.sha}`}
				target="_blank"
				rel="noreferrer"
			>
				{commit.sha.slice(0, SHORT_SHA)}
			</Link>
		</Tooltip>
	);
}
