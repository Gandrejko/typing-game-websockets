export const getSortedUsers = (users) => {
  return users.sort((a, b) => b.speed - a.speed).filter(user => user.speed !== null).map(user => user.username)
}
