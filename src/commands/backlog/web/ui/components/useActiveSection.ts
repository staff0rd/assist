import { DEFAULT_PINNED_HEADER_HEIGHT } from "./itemSectionAnchor";
import { useActiveAnchor } from "./useActiveAnchor";

export function useActiveSection(
	ids: string[],
	stickyOffset = DEFAULT_PINNED_HEADER_HEIGHT,
): string | undefined {
	return useActiveAnchor(ids, stickyOffset);
}
