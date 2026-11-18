import type { Theme } from "@mui/material/styles";
import type { CardTone } from "./boardCardSx";

export function toneColor(t: Theme, tone: CardTone): string {
	return tone === "neutral" ? t.palette.text.secondary : t.palette[tone].main;
}
