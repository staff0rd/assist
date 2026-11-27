export type LoginCredentials = { username?: string; password: string };

export type InstanceAuth = {
	strategy: "login-script";
	script: string;
	credentials: LoginCredentials;
};
