import { useState } from "react";
import { useSearchParams } from "react-router";
import type { FileContentState } from "../fetchFileContent";
import type { FileViewMode } from "./FileViewMode";
import { languageForPath } from "../refractorHighlighter";
import type { SessionInfo } from "../../../../types";
import { useFileBuffer } from "./useFileViewState/useFileBuffer";
import { type FileComments, useFileComments } from "./useFileComments";
import { useFileContent } from "../useFileContent";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { useSaveHotkey } from "./useFileViewState/useSaveHotkey";

export function useFileViewState(
	sessions: SessionInfo[],
	cardId: string | null,
	sendInput: (sessionId: string, data: string) => void,
): {
	path: string;
	cwd: string;
	state: FileContentState;
	buffer: ReturnType<typeof useFileBuffer>;
	comments: FileComments;
	isMarkdown: boolean;
	mode: FileViewMode;
	setMode: (mode: FileViewMode) => void;
} {
	const [searchParams] = useSearchParams();
	const path = searchParams.get("path") ?? "";
	const { worktreeCwd } = useRepoSelectionContext();
	const cwd = searchParams.get("cwd") || worktreeCwd;
	const state = useFileContent(cwd, path);
	const buffer = useFileBuffer(cwd, path, state);
	const comments = useFileComments(sessions, cardId, sendInput);
	const [mode, setMode] = useState<FileViewMode>("raw");
	useSaveHotkey(buffer.save);

	return {
		path,
		cwd,
		state,
		buffer,
		comments,
		isMarkdown: languageForPath(path) === "markdown",
		mode,
		setMode,
	};
}
