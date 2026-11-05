let current: string | undefined;

export const autoRestartWait = {
	get: (): string | undefined => current,
	set: (wait: string | undefined): void => {
		current = wait;
	},
};
