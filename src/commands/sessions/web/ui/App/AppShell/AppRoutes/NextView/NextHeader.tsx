import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { Link as RouterLink } from "react-router";
import type { NextResponse } from "../../../../../next/types";
import { NextHeaderTitle } from "./NextHeader/NextHeaderTitle";
import { NextRefreshButton } from "./NextHeader/NextRefreshButton";

const progressSx = {
	position: "absolute",
	left: 0,
	right: 0,
	top: "100%",
	mt: "9px",
} as const;

export function NextHeader({
	cwd,
	loading,
	data,
	onRefresh,
}: {
	cwd: string;
	loading: boolean;
	data: NextResponse | null;
	onRefresh: () => void;
}) {
	const refreshing = loading && data !== null;
	return (
		<Box sx={{ mb: "22px", position: "relative" }}>
			<Stack
				direction="row"
				useFlexGap
				sx={{ gap: "8px 16px", alignItems: "flex-start" }}
			>
				<NextHeaderTitle cwd={cwd} loading={loading} data={data} />
				<Stack direction="row" spacing={1}>
					<Button component={RouterLink} to="/config?search=next">
						Next settings
					</Button>
					<NextRefreshButton
						loading={loading}
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				</Stack>
			</Stack>
			{refreshing && (
				<LinearProgress aria-label="Refreshing Next items" sx={progressSx} />
			)}
		</Box>
	);
}
