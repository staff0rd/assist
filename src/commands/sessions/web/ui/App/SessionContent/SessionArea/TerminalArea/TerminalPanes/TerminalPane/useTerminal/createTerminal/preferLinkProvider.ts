import type { ILinkProvider, Terminal } from "@xterm/xterm";

type TerminalInternals = {
	_core?: { _linkProviderService?: { linkProviders?: ILinkProvider[] } };
};

export function preferLinkProvider(
	term: Terminal,
	provider: ILinkProvider,
): void {
	const providers = (term as unknown as TerminalInternals)._core
		?._linkProviderService?.linkProviders;
	const index = providers?.indexOf(provider) ?? -1;
	if (!providers || index <= 0) return;
	providers.splice(index, 1);
	providers.unshift(provider);
}
