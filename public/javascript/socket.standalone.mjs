import username from "./username.standalone.mjs"

const socket = io("", { query: { username } });

export default socket;