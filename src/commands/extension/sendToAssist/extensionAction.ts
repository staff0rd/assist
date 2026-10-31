type ExtensionAction = {
	onClicked: { addListener: (listener: () => void) => void };
};

type ExtensionGlobal = { browser?: { action?: ExtensionAction } };

export function extensionAction(): ExtensionAction | undefined {
	return (globalThis as ExtensionGlobal).browser?.action;
}
