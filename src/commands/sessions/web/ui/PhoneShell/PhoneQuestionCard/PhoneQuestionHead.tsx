import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { touchTarget } from "../../designSystem/touchTarget";

export function PhoneQuestionHead({
	header,
	multiSelect,
	page,
	total,
	onBack,
}: {
	header: string;
	multiSelect: boolean;
	page: number;
	total: number;
	onBack?: () => void;
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<Box
				component="span"
				sx={{
					flex: 1,
					fontSize: 12,
					fontWeight: 600,
					letterSpacing: ".04em",
					textTransform: "uppercase",
					color: "warning.main",
				}}
			>
				{header} · {multiSelect ? "pick any" : "pick one"}
			</Box>
			{onBack && (
				<ButtonBase
					sx={{ minHeight: touchTarget, px: 1, color: "primary.main" }}
					onClick={onBack}
				>
					Back
				</ButtonBase>
			)}
			<Box
				component="span"
				sx={{
					fontFamily: "fontFamilyMono",
					fontSize: 12,
					color: "text.secondary",
				}}
			>
				{page + 1} of {total}
			</Box>
		</Box>
	);
}
