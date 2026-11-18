import Stack from "@mui/material/Stack";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { SessionInfo } from "../../../../../types";
import { NextItemActions } from "../NextItemActions";
import { NextRepoRef } from "../NextRepoRef";
import { sessionTextSize } from "../../../../sessionTextSize";

const nextRowSx = (t: Theme) => ({
	px: "14px",
	py: "10px",
	alignItems: { sm: "center" },
	transition: "background-color .2s ease",
	"&:hover": { bgcolor: t.tokens.color.raised },
	"& + &": { borderTop: 1, borderColor: t.tokens.color.lineSoft },
});

const titleSx = {
	fontWeight: 600,
	fontSize: sessionTextSize(14),
	overflowWrap: "anywhere",
} as const;

export function NextRow({
	repo,
	number,
	title,
	facts,
	url,
	onStart,
	sessions,
}: {
	repo: string;
	number: number;
	title: string;
	facts: ReactNode;
	url: string;
	onStart: (cwd: string) => void;
	sessions?: SessionInfo[];
}) {
	return (
		<Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={nextRowSx}>
			<Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
				<Stack
					direction="row"
					spacing={1}
					useFlexGap
					sx={{ alignItems: "baseline", flexWrap: "wrap" }}
				>
					<NextRepoRef repo={repo} number={number} />
					<Typography sx={titleSx}>{title}</Typography>
				</Stack>
				{facts}
			</Stack>
			<NextItemActions
				repo={repo}
				url={url}
				onStart={onStart}
				sessions={sessions}
			/>
		</Stack>
	);
}
