const username = sessionStorage.getItem("username");

if (!username) {
	window.location.replace("/login");
}

export default username;