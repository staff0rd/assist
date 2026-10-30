import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { ReactNode } from "react";

export const SWIPE_ACTION_WIDTH = 80;

const actionsSx = {
	position: "absolute",
	top: 0,
	bottom: 0,
	right: 0,
	display: "flex",
} as const;

function actionSx(palette: "primary" | "error") {
	return {
		width: SWIPE_ACTION_WIDTH,
		display: "flex",
		flexDirection: "column",
		gap: 0.25,
		fontSize: 13,
		fontWeight: 600,
		bgcolor: `${palette}.main`,
		color: `${palette}.contrastText`,
	} as const;
}

function SwipeAction({
	label,
	icon,
	palette,
	onClick,
}: {
	label: string;
	icon: ReactNode;
	palette: "primary" | "error";
	onClick: () => void;
}) {
	return (
		<ButtonBase sx={actionSx(palette)} onClick={onClick}>
			{icon}
			{label}
		</ButtonBase>
	);
}

type Props = {
	finished: boolean;
	starred: boolean;
	onStar: () => void;
	onEnd: () => void;
};

export function PhoneSwipeActions({ finished, starred, onStar, onEnd }: Props) {
	return (
		<Box sx={actionsSx}>
			<SwipeAction
				label={starred ? "Unstar" : "Star"}
				icon={starred ? <StarIcon /> : <StarBorderIcon />}
				palette="primary"
				onClick={onStar}
			/>
			<SwipeAction
				label={finished ? "Dismiss" : "End"}
				icon={<CloseIcon />}
				palette="error"
				onClick={onEnd}
			/>
		</Box>
	);
}
