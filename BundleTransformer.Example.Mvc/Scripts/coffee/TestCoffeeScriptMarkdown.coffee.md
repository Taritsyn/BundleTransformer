Border style of **Badge**.

	borderStyle = "solid";

Sets a border style of **Badge**.

	setElemBorderStyle = (id, style) ->
		elem = document.getElementById(id)
		elem.style.borderStyle = style if elem?

Set the specified border style.

	setElemBorderStyle("coffee", borderStyle)