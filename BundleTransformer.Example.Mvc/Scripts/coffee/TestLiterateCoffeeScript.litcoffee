Flag for whether to enable **Badge**.

	coffeeEnabled = on

Enables a DOM element.

	enableElem = (id) -> 
		elem = document.getElementById(id)
		elem.className = "enabled" if elem?

If value of variable `coffeeEnabled` equals to `on`, then enable a **Badge**.

	if coffeeEnabled is on
		enableElem("coffee")