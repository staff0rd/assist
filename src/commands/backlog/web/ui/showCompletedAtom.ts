import { atomWithStorage } from "jotai/utils";

export const showCompletedAtom = atomWithStorage(
	"backlog-show-completed",
	false,
);
