export type User = {
	username: string,
	ready: boolean,
	speed: number | null,
}

export type RoomsMap = Map<string, User[]>;

