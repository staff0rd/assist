import { usePreviewWidthContext } from "../../../../usePreviewWidthContext";
import { slideInSx } from "../slideInSx";

export function useSlideInSx(open: boolean) {
	const { full, stacked } = usePreviewWidthContext();
	return slideInSx(open, full, stacked);
}
