export const setPlayerSpeed = ({ room, username, lettersCount, time }) => {
  return room.map(user => {
    if(user.username === username) {
      user = {
        ...user,
        speed: +(lettersCount / time).toFixed(2)
      }
    }

    return user
  })
}