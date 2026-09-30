import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { NextItemActions } from "../NextItemActions";
import { NextRepoRef } from "../NextRepoRef";

export function NextRow({
	repo,
	number,
	title,
	facts,
	url,
	onStart,
}: {
	repo: string;
	number: number;
	title: string;
	facts: ReactNode;
	url: string;
	onStart: (cwd: string) => void;
}) {
	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			spacing={1}
			sx={{
				px: 2,
				py: 1.25,
				alignItems: { sm: "center" },
				"& + &": { borderTop: 1, borderColor: "divider" },
			}}
		>
			<Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
				<Stack
					direction="row"
					spacing={1}
					useFlexGap
					sx={{ alignItems: "baseline", flexWrap: "wrap" }}
				>
					<NextRepoRef repo={repo} number={number} />
					<Typography sx={{ fontWeight: 500, overflowWrap: "anywhere" }}>
						{title}
					</Typography>
				</Stack>
				{facts}
			</Stack>
			<NextItemActions repo={repo} url={url} onStart={onStart} />
		</Stack>
	);
}
