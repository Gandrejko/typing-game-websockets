export const getSortedUsers = (users) => {
  return users.sort((a, b) => b.speed - a.speed).map(user => user.username)
}
