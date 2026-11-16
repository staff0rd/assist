import { keyframes } from "@emotion/react";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import { type TransferTone, transferToneColor } from "./transferIndicator";

const lift = keyframes`
	0%, 100% { transform: translateY(1px); opacity: 0.7; }
	50% { transform: translateY(-2px); opacity: 1; }
`;

const glyphSx = {
	gridColumn: 1,
	gridRow: 1,
	justifySelf: "center",
	alignSelf: "center",
	fontSize: 14,
} as const;

const liftingSx = {
	...glyphSx,
	animation: `${lift} 1.1s ease-in-out infinite`,
	"@media (prefers-reduced-motion: reduce)": { animation: "none" },
} as const;

export function TransferGlyph({
	tone,
	label,
}: {
	tone: TransferTone;
	label: string;
}) {
	return (
		<MoveUpIcon
			titleAccess={label}
			data-testid={`transfer-glyph-${tone}`}
			sx={{
				...(tone === "pending" ? liftingSx : glyphSx),
				color: transferToneColor[tone],
			}}
		/>
	);
}
