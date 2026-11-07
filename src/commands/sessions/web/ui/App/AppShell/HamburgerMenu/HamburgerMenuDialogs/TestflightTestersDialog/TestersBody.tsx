import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import type { ComponentProps } from "react";
import { TesterLists } from "./TesterLists";

const alertSx = {
	mx: 3,
	my: 2,
	whiteSpace: "pre-wrap",
	overflowWrap: "anywhere",
} as const;

type Props = Omit<ComponentProps<typeof TesterLists>, "testers"> & {
	loading: boolean;
	error?: string;
	testers?: ComponentProps<typeof TesterLists>["testers"];
};

export function TestersBody({ loading, error, testers, ...lists }: Props) {
	if (error)
		return (
			<Alert severity="error" sx={alertSx}>
				{error}
			</Alert>
		);
	if (!testers)
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
				{loading && <CircularProgress size={24} aria-label="Loading" />}
			</Box>
		);
	return <TesterLists testers={testers} {...lists} />;
}
