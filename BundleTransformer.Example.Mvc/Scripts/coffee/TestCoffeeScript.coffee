square = (x) -> x * x

showElem = (id) -> 
	elem = document.getElementById(id)
	elem.style.display = "block" if elem?

if square(5) isnt 24
	showElem("coffee")