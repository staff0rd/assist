import { type FocusEvent, useRef, useState } from "react";

type Launcher = (prompt: string, cwd: string) => void;
type ArmedHarness = "claude" | "pi" | null;

export function usePromptLauncher(
	cwd: string,
	onCreate: Launcher,
	onCreatePi: Launcher,
) {
	const wrapperRef = useRef<HTMLFieldSetElement>(null);
	const caretRef = useRef<HTMLButtonElement>(null);
	const [armed, setArmed] = useState<ArmedHarness>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [prompt, setPrompt] = useState("");

	return {
		wrapperRef,
		caretRef,
		armed,
		menuOpen,
		prompt,
		setPrompt,
		togglePrompt: () => setArmed((h) => (h === "claude" ? null : "claude")),
		openMenu: () => setMenuOpen(true),
		closeMenu: () => setMenuOpen(false),
		armPi: () => {
			setMenuOpen(false);
			setArmed("pi");
		},
		handleBlur: (e: FocusEvent) => {
			if (!wrapperRef.current?.contains(e.relatedTarget as Node))
				setArmed(null);
		},
		submit: () => {
			(armed === "pi" ? onCreatePi : onCreate)(prompt, cwd);
			setPrompt("");
			setArmed(null);
		},
	};
}
