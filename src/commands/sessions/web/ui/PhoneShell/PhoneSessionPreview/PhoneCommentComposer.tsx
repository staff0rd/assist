import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Slide from "@mui/material/Slide";
import { safeAreaInsets } from "../../designSystem/safeAreaInsets";
import { useKeyboardViewport } from "../useKeyboardViewport";
import type { PhoneCommentComposerProps } from "./PhoneCommentComposer/PhoneCommentComposerProps";
import { PhoneComposerPages } from "./PhoneCommentComposer/PhoneComposerPages";

const SHEET_GAP_PX = 12;

const sheetSx = {
	position: "fixed",
	left: 0,
	right: 0,
	display: "flex",
	flexDirection: "column",
	bgcolor: "background.paper",
	borderRadius: "14px 14px 0 0",
	outline: "none",
	overflow: "hidden",
} as const;

export function PhoneCommentComposer(props: PhoneCommentComposerProps) {
	const open = props.quote !== undefined;
	const viewport = useKeyboardViewport();
	const inset = `(${safeAreaInsets.top} + ${SHEET_GAP_PX}px)`;

	return (
		<Modal open={open} onClose={props.onCancel}>
			<Slide direction="up" in={open}>
				<Box
					sx={sheetSx}
					style={{
						top: `calc(${viewport.offsetTop}px + ${inset})`,
						height: `calc(${viewport.height}px - ${inset})`,
						paddingBottom: viewport.keyboardOpen ? 0 : safeAreaInsets.bottom,
					}}
					data-testid="phone-comment-composer"
				>
					<PhoneComposerPages
						key={`${props.quote}:${props.initialNote}`}
						{...props}
						quote={props.quote ?? ""}
					/>
				</Box>
			</Slide>
		</Modal>
	);
}
