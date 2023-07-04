const usernameSS = sessionStorage.getItem("username");

if (!usernameSS) {
	window.location.replace("/login");
}

export default usernameSS;