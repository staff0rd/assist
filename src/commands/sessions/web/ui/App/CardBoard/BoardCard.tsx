import ButtonBase from "@mui/material/ButtonBase";
import type { ReactNode } from "react";
import { boardCardSx, type CardTone } from "./boardCardSx";

export function BoardCard({
	tone,
	selected,
	onOpen,
	testId,
	children,
}: {
	tone: CardTone;
	selected: boolean;
	onOpen: () => void;
	testId: string;
	children: ReactNode;
}) {
	return (
		<ButtonBase
			component="div"
			focusRipple
			onClick={onOpen}
			aria-pressed={selected}
			data-testid={testId}
			sx={boardCardSx(tone, selected)}
		>
			{children}
		</ButtonBase>
	);
}
