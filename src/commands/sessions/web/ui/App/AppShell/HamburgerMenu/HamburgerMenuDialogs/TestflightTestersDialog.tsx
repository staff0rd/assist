import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { TestersBody } from "./TestflightTestersDialog/TestersBody";
import { TestersDialogHeader } from "./TestflightTestersDialog/TestersDialogHeader";
import { useTestflightTesters } from "./TestflightTestersDialog/useTestflightTesters";

export function TestflightTestersDialog({
	fullScreen,
	onClose,
}: {
	fullScreen?: boolean;
	onClose: () => void;
}) {
	const theme = useTheme();
	const narrow = useMediaQuery(theme.breakpoints.down("sm"));
	const sheet = fullScreen ?? narrow;
	const { loading, error, testers, refresh } = useTestflightTesters();

	return (
		<Dialog
			open
			onClose={onClose}
			fullScreen={sheet}
			maxWidth="sm"
			fullWidth
			aria-labelledby="testflight-testers-title"
		>
			<TestersDialogHeader
				sheet={sheet}
				bundleId={testers?.bundleId}
				loading={loading}
				onRefresh={refresh}
				onClose={onClose}
			/>
			<Box sx={{ flex: 1, overflowY: "auto", pt: 1 }}>
				<TestersBody loading={loading} error={error} testers={testers} />
			</Box>
		</Dialog>
	);
}
