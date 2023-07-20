export const resetPlayers = (players) => {
  return players.map(player => {
    return {
      ...player,
      ready: false,
      speed: null,
    }
  })
}