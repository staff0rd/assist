import mermaid from "mermaid";
import {
	removeStrayMermaidNode,
	showSourceFallback,
} from "./showSourceFallback";

let mermaidRenderSeq = 0;
let mermaidRenderQueue: Promise<unknown> = Promise.resolve();

export async function renderMermaidDiagram(
	target: HTMLElement,
	source: string,
	mode: "light" | "dark",
	isCancelled: () => boolean,
): Promise<void> {
	const id = `mermaid-${(mermaidRenderSeq += 1)}`;
	try {
		const svg = await queueMermaidRender(() => {
			mermaid.initialize({
				startOnLoad: false,
				theme: mode === "dark" ? "dark" : "default",
			});
			return mermaid.render(id, source).then((result) => result.svg);
		});
		if (isCancelled()) return;
		target.innerHTML = svg;
	} catch {
		removeStrayMermaidNode(id);
		if (isCancelled()) return;
		showSourceFallback(target, source);
	}
}

function queueMermaidRender<T>(task: () => Promise<T>): Promise<T> {
	const result = mermaidRenderQueue.then(task, task);
	mermaidRenderQueue = result.then(
		() => undefined,
		() => undefined,
	);
	return result;
}
