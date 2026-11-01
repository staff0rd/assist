import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { ReactNode } from "react";
import type { PrPreview } from "../../../shared/SessionInfoBase";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { touchTarget } from "../designSystem/touchTarget";
import { PhonePreviewCardHeading } from "./PhonePreviewCard/PhonePreviewCardHeading";
import { phoneCardSx } from "./phoneCardSx";

const reviewSx = {
	borderRadius: "12px",
	minHeight: touchTarget,
	fontWeight: 600,
} as const;

export function PhonePreviewCard({
	preview,
	keyboardOpen,
	reviewLabel,
	onReview,
	actions,
}: {
	preview: PrPreview;
	keyboardOpen: boolean;
	reviewLabel: string;
	onReview: () => void;
	actions: ReactNode;
}) {
	const pb = keyboardOpen ? 1.5 : `calc(${safeAreaInsets.bottom} + 12px)`;

	return (
		<Box sx={{ ...phoneCardSx, pb }} data-testid="phone-preview-card">
			<PhonePreviewCardHeading preview={preview} />
			<Button variant="outlined" sx={reviewSx} onClick={onReview}>
				{reviewLabel}
			</Button>
			<Box sx={{ flex: 1 }} />
			{actions}
		</Box>
	);
}
