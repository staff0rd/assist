import type { CardTone } from "./boardCardSx";

export function cardMinHeight(tone: CardTone, compact: boolean) {
	if (compact) return 0;
	return tone === "neutral" ? 168 : 208;
}
