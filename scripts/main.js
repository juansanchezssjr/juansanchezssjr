function updatestatic() {
	const birthDate = new Date(2008, 4, 2);
	const currentDate = new Date();
	let age = currentDate.getFullYear() - birthDate.getFullYear();
	const birthdayThisYear = new Date(
		currentDate.getFullYear(),
		birthDate.getMonth(),
		birthDate.getDate()
	);

	if (currentDate < birthdayThisYear) {
		age -= 1;
	}

	document.querySelectorAll('.c-datac__edad').forEach((element) => {
		element.textContent = `${age} años`;
	});
}

updatestatic();
