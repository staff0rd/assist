import type { DragEvent } from "react";
import { useEffect } from "react";
import { imageFromClipboard, imageFromDrop } from "./imageFromClipboard";

export function useImageDropPaste(onFile: (file: File) => void) {
	useEffect(() => {
		const onPaste = (e: ClipboardEvent) => {
			const file = imageFromClipboard(e.clipboardData);
			if (!file) return;
			e.preventDefault();
			onFile(file);
		};
		globalThis.addEventListener("paste", onPaste);
		return () => globalThis.removeEventListener("paste", onPaste);
	}, [onFile]);

	const onDrop = (e: DragEvent) => {
		const file = imageFromDrop(e.dataTransfer);
		if (!file) return;
		e.preventDefault();
		onFile(file);
	};

	const onDragOver = (e: DragEvent) => {
		if (Array.from(e.dataTransfer.items).some((i) => i.kind === "file"))
			e.preventDefault();
	};

	return { onDrop, onDragOver };
}
