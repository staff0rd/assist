import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { safeAreaInsets } from "../../../../../designSystem/safeAreaInsets";
import { TestersDialogTitle } from "./TestersDialogTitle";

const headerSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.5,
	pl: 3,
	pr: 1,
	py: 2,
	borderBottom: 1,
	borderColor: "divider",
} as const;

const sheetHeaderSx = {
	...headerSx,
	pl: 0.5,
	pr: 0.5,
	pt: `calc(${safeAreaInsets.top} + 8px)`,
	pb: 1,
} as const;

type Props = {
	sheet: boolean;
	bundleId?: string;
	loading: boolean;
	onRefresh: () => void;
	onClose: () => void;
};

export function TestersDialogHeader(props: Props) {
	const close = (
		<IconButton aria-label="Close" onClick={props.onClose}>
			<CloseIcon />
		</IconButton>
	);
	return (
		<Box sx={props.sheet ? sheetHeaderSx : headerSx}>
			{props.sheet && close}
			<TestersDialogTitle sheet={props.sheet} bundleId={props.bundleId} />
			<IconButton
				aria-label="Refresh"
				onClick={props.onRefresh}
				disabled={props.loading}
			>
				<RefreshIcon />
			</IconButton>
			{!props.sheet && close}
		</Box>
	);
}
