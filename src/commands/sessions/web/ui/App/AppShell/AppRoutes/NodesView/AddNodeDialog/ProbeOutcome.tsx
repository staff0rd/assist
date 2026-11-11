import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import type { AddNodeStep } from "./FoundNode";

export function ProbeOutcome({
	step,
	error,
}: {
	step: AddNodeStep;
	error: string | null;
}) {
	if (error)
		return (
			<Alert severity="error" role="alert">
				{error}
			</Alert>
		);
	if (step.kind !== "found" && step.kind !== "linking") return null;
	const { name, version } = step.node;
	return (
		<Alert severity="info" icon={false} aria-label="Found node">
			<Box component="strong" sx={{ display: "block" }}>
				{name}
			</Box>
			assist {version} · linked by its{" "}
			<Box component="span" sx={{ fontFamily: "fontFamilyMono" }}>
				sessions.nodeName
			</Box>
		</Alert>
	);
}
