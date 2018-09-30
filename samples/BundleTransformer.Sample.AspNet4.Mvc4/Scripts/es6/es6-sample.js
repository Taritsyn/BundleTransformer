class SampleComponent {
	constructor() { }

	sampleAction() {
		console.log('ES6 test OK');
	}
}

(() => {
	const component = new SampleComponent();
	component.sampleAction();
})();