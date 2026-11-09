import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AddNoticeToast } from "./TestflightTestersDialog/AddNoticeToast";
import { AddTesterForm } from "./TestflightTestersDialog/AddTesterForm";
import { TestersBody } from "./TestflightTestersDialog/TestersBody";
import { TestersDialogHeader } from "./TestflightTestersDialog/TestersDialogHeader";
import { useAddTester } from "./TestflightTestersDialog/useAddTester";
import { useTestflightTesters } from "./TestflightTestersDialog/useTestflightTesters";

export function TestflightTestersDialog({ onClose }: { onClose: () => void }) {
	const theme = useTheme();
	const sheet = useMediaQuery(theme.breakpoints.down("sm"));
	const { loading, error, testers, refresh } = useTestflightTesters();
	const { add, pending, notice, clearNotice } = useAddTester(() =>
		refresh(true),
	);

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
				onRefresh={() => void refresh()}
				onClose={onClose}
			/>
			<AddTesterForm
				sheet={sheet}
				pending={pending !== undefined}
				onAdd={add}
			/>
			<Box sx={{ flex: 1, overflowY: "auto", pt: 1 }}>
				<TestersBody
					loading={loading}
					error={error}
					testers={testers}
					pending={pending}
					onAddToGroup={(email) => void add(email, true)}
				/>
			</Box>
			<AddNoticeToast notice={notice} onClose={clearNotice} />
		</Dialog>
	);
}
