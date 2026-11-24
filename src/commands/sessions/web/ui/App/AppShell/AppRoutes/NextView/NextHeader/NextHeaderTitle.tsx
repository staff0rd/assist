import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextResponse } from "../../../../../../next/types";
import { repoName } from "../../../../../repoName";
import { sessionTextSize } from "../../../../sessionTextSize";
import { NextScopeNote } from "./NextScopeNote";

const headingSx = {
	flex: 1,
	m: 0,
	mb: 0.5,
	fontSize: sessionTextSize(22),
	fontWeight: 600,
	lineHeight: 1.3,
	letterSpacing: "-0.01em",
} as const;

export function NextHeaderTitle({
	cwd,
	loading,
	data,
}: {
	cwd: string;
	loading: boolean;
	data: NextResponse | null;
}) {
	return (
		<Stack sx={{ flex: 1, minWidth: 0 }}>
			<Typography component="h2" sx={headingSx}>
				Next
			</Typography>
			{data ? (
				<NextScopeNote scope={data.scope} boards={data.boards} />
			) : (
				loading &&
				cwd && (
					<Typography variant="body2" color="text.secondary">
						Loading {repoName(cwd)}…
					</Typography>
				)
			)}
		</Stack>
	);
}
