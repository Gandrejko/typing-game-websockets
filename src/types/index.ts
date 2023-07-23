export type User = {
	username: string,
	ready: boolean,
	speed: number | null,
}

export type Room = {
	users: User[],
	time: number,
	text: string,
}

export type RoomsMap = Map<string, Room>;

