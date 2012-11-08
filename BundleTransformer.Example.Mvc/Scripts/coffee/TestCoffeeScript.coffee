coffeeEnabled = on
square = (x) -> x * x
showElem = (id) -> 
	doc = document.getElementById(id)
	doc.style.display = "block" if doc?
enableElem = (id) -> 
	doc = document.getElementById(id)
	doc.className = "enabled" if doc?

if coffeeEnabled is on and square(5) isnt 24
	elemId = "coffee"

	showElem(elemId)
	enableElem(elemId)