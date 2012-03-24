coffeeEnabled = on
square = (x) -> x * x
showElem = (id) -> document.getElementById(id).style.display = "block"
enableElem = (id) -> document.getElementById(id).className = "enabled"

if coffeeEnabled is on and square(5) isnt 24
	elemId = "coffee"

	showElem(elemId)
	enableElem(elemId)