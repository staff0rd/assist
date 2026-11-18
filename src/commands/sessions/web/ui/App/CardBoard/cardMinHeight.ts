import type { CardTone } from "./boardCardSx";

export function cardMinHeight(tone: CardTone) {
	return tone === "neutral" ? 168 : 208;
}
