import ButtonBase from "@mui/material/ButtonBase";
import type { ReactNode } from "react";
import { boardCardSx, type CardTone } from "./boardCardSx";

export function BoardCard({
	tone,
	selected,
	compact,
	onOpen,
	testId,
	children,
}: {
	tone: CardTone;
	selected: boolean;
	compact: boolean;
	onOpen: () => void;
	testId: string;
	children: ReactNode;
}) {
	return (
		<ButtonBase
			focusRipple
			onClick={onOpen}
			aria-pressed={selected}
			data-testid={testId}
			sx={boardCardSx(tone, selected, compact)}
		>
			{children}
		</ButtonBase>
	);
}
