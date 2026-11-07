import ButtonBase from "@mui/material/ButtonBase";
import { touchTarget } from "../../designSystem/touchTarget";

const linkSx = {
	alignSelf: "flex-start",
	minHeight: touchTarget,
	typography: "body2",
	color: "warning.main",
	borderRadius: 1,
} as const;

export function PhoneReviewCommentsLink({
	count,
	onOpen,
}: {
	count: number;
	onOpen: () => void;
}) {
	if (count === 0) return null;
	return (
		<ButtonBase sx={linkSx} onClick={onOpen}>
			{count === 1 ? "1 review comment ›" : `${count} review comments ›`}
		</ButtonBase>
	);
}
