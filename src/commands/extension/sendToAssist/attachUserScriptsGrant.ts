const USER_SCRIPTS = { permissions: ["userScripts"] };

type Permissions = {
	contains: (permissions: typeof USER_SCRIPTS) => Promise<boolean>;
	request: (permissions: typeof USER_SCRIPTS) => Promise<boolean>;
};

function extensionPermissions(): Permissions | undefined {
	return (globalThis as { browser?: { permissions?: Permissions } }).browser
		?.permissions;
}

export async function attachUserScriptsGrant(
	root: ParentNode = document,
): Promise<void> {
	const button = root.querySelector<HTMLButtonElement>("[data-grant-scripts]");
	const status = root.querySelector<HTMLElement>("[data-scripts-status]");
	const permissions = extensionPermissions();
	if (!button || !status || !permissions) return;
	const show = (granted: boolean) => {
		status.textContent = granted ? "Allowed" : "Not allowed";
		button.hidden = granted;
	};
	show(await permissions.contains(USER_SCRIPTS));
	button.addEventListener("click", async () => {
		show(await permissions.request(USER_SCRIPTS).catch(() => false));
	});
}
