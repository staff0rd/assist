import { useRef, useState } from "react";
import { postNodesApi } from "../postNodesApi";
import type { AddNodeStep, FoundNode } from "./FoundNode";
import { linkFoundNode } from "./linkFoundNode";

function message(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export function useAddNode(onLinked: (notice: string) => void) {
	const [url, setUrl] = useState("");
	const [step, setStep] = useState<AddNodeStep>({ kind: "idle" });
	const [error, setError] = useState<string | null>(null);
	const attempt = useRef(0);

	const changeUrl = (next: string) => {
		attempt.current++;
		setUrl(next);
		setStep({ kind: "idle" });
		setError(null);
	};

	const check = async () => {
		const current = ++attempt.current;
		setStep({ kind: "checking" });
		setError(null);
		try {
			const node = await postNodesApi<FoundNode>("probe", { url: url.trim() });
			if (current === attempt.current) setStep({ kind: "found", node });
		} catch (error) {
			if (current !== attempt.current) return;
			setStep({ kind: "idle" });
			setError(message(error));
		}
	};

	const link = async (node: FoundNode) => {
		setStep({ kind: "linking", node });
		setError(null);
		try {
			onLinked(await linkFoundNode(node));
		} catch (error) {
			setStep({ kind: "found", node });
			setError(message(error));
		}
	};

	const submit = () => {
		if (step.kind === "found") void link(step.node);
		else if (step.kind === "idle" && url.trim()) void check();
	};

	return { url, changeUrl, step, error, submit };
}
