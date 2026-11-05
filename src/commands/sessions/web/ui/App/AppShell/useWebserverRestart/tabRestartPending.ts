let pending = false;

export const tabRestartPending = {
	get: (): boolean => pending,
	set: (value: boolean): void => {
		pending = value;
	},
};
