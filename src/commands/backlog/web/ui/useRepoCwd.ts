import { useRepoSelectionContext } from "../../../sessions/web/ui/useRepoSelectionContext";

export function useRepoCwd(): string | undefined {
	const { selectedCwd } = useRepoSelectionContext();
	return selectedCwd || undefined;
}
