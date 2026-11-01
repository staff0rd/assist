import { useTheme } from "@mui/material/styles";
import { type RefObject, useMemo } from "react";
import { useElementWidth } from "../../App/useElementWidth";
import { fitFontSize } from "./fitFontSize";
import { measureCharWidthRatio } from "./measureCharWidthRatio";
import { usePinchZoom } from "./usePinchZoom";

export function usePhoneFontSize(
	scrollRef: RefObject<HTMLElement | null>,
	cols: number,
) {
	const { tokens } = useTheme();
	const ratio = useMemo(
		() => measureCharWidthRatio(tokens.font.terminal),
		[tokens.font.terminal],
	);
	const width = useElementWidth(scrollRef) ?? window.innerWidth;
	const zoom = usePinchZoom(scrollRef);
	return { ratio, fontSize: fitFontSize(width, cols, ratio, zoom) };
}
