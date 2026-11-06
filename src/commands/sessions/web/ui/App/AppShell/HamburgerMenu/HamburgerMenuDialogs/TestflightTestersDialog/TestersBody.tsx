import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import type { TestflightTesters } from "../../../../../../../../testflight/TestflightTesters";
import { TesterRow } from "./TesterRow";
import { TesterSection } from "./TesterSection";

const alertSx = {
	mx: 3,
	my: 2,
	whiteSpace: "pre-wrap",
	overflowWrap: "anywhere",
} as const;

export function TestersBody({
	loading,
	error,
	testers,
}: {
	loading: boolean;
	error?: string;
	testers?: TestflightTesters;
}) {
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
	return (
		<Box sx={{ pb: 2 }}>
			<TesterSection
				name="Internal"
				hint="team members · no beta review"
				empty={testers.internal.length === 0}
			>
				{testers.internal.map((person) => (
					<TesterRow key={person.email} {...person} />
				))}
			</TesterSection>
			<TesterSection
				name="External"
				hint="email only · beta review per version"
				empty={testers.external.length === 0}
			>
				{testers.external.map((tester) => (
					<TesterRow key={tester.email} {...tester} />
				))}
			</TesterSection>
		</Box>
	);
}
