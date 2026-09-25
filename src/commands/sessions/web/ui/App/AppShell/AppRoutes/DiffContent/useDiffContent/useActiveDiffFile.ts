import { useActiveAnchor } from "../../../../../../../../backlog/web/ui/components/useActiveAnchor";
import { diffFileDomId } from "../diffFileDomId";
import { DIFF_TOOLBAR_HEIGHT } from "../DiffToolbar";

export function useActiveDiffFile(fileKeys: string[]): string | undefined {
	const activeId = useActiveAnchor(
		fileKeys.map(diffFileDomId),
		DIFF_TOOLBAR_HEIGHT,
	);

	return fileKeys.find((fileKey) => diffFileDomId(fileKey) === activeId);
}
