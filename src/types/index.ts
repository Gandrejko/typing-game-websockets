export type Username = string;

export type RoomName = string;

export type User = {
	username: Username,
	ready: boolean,
	speed: number | null,
}

export type Room = User[];

export type RoomsMap = Map<RoomName, Room>;

