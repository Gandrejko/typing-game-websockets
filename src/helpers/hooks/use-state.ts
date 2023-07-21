const useState = <T>(initialValue: T): [() => T, (newValue: T) => void] => {
	let state: T = initialValue;

	const getState = () => state;
	const setState = (newValue: T): void => {
		state = newValue;
	};

	return [getState, setState];
};

export default useState;