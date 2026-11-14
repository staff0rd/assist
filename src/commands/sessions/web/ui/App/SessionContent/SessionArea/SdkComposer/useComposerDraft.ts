import { createContext, useContext, useEffect, useRef } from "react";

type AppendDraft = (text: string) => void;

type ComposerDraftRegistry = {
	register: (sessionId: string, append: AppendDraft) => () => void;
	append: (sessionId: string, text: string) => void;
};

export function createComposerDraftRegistry(): ComposerDraftRegistry {
	const composers = new Map<string, AppendDraft>();
	return {
		register: (sessionId, append) => {
			composers.set(sessionId, append);
			return () => {
				if (composers.get(sessionId) === append) composers.delete(sessionId);
			};
		},
		append: (sessionId, text) => composers.get(sessionId)?.(text),
	};
}

export const ComposerDraftContext = createContext<
	ComposerDraftRegistry | undefined
>(undefined);

export function useComposerDraft(): ComposerDraftRegistry | undefined {
	return useContext(ComposerDraftContext);
}

export function useRegisterComposerDraft(
	sessionId: string | undefined,
	append: AppendDraft,
): void {
	const registry = useComposerDraft();
	const latest = useRef(append);
	useEffect(() => {
		latest.current = append;
	});
	useEffect(() => {
		if (!registry || !sessionId) return;
		return registry.register(sessionId, (text) => latest.current(text));
	}, [registry, sessionId]);
}
