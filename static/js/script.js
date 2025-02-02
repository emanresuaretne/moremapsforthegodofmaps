function hexToRgb(hex) {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return null;
    return `rgb(${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)})`;
}

function toggleGroup(button) {
	const buttons = button.parentElement.nextElementSibling;
	buttons.classList.toggle('hidden');
	
	button.textContent = buttons.classList.contains('hidden') ? '▼' : '▲';
}

function searchFunction(value) {
	var searchString = value.toLowerCase();
	
	var maps_counter = 0;
	for (const d in features_list) {
		const domain_element = document.getElementById(`domain_${d}`)
		var domain_satisfies = false;
		
		const domain_maps = features_list[d]["maps"]
		for (const m in domain_maps) {
			const map_element = document.getElementById(`map_${maps_counter}`)
			var map_satisfies = false;
			
			const domain_map = domain_maps[m]
			if (domain_map["name"].toLowerCase().includes(searchString)) {
				map_satisfies = true;
			};
			
			const map_features = domain_map["features"]
			for (const map_feature of map_features) {
				//feature_element = document.getElementById(`feature_${map_feature[0]}`)
				
				if (map_feature[1].toLowerCase().includes(searchString)) {
					map_satisfies = true;
				};
			};
			
			if (map_satisfies) {
				domain_satisfies = true;
			};
			
			const map_triangle = map_element.nextElementSibling;
			const map_triangle_state = map_triangle.innerText;
			
			if (searchString) {
				if ((map_satisfies && map_triangle_state == "▼") || (!map_satisfies && map_triangle_state == "▲")) {
					map_triangle.click();
				};
			} else {
				if (map_triangle_state == "▲") {
					map_triangle.click();
				};
			};
			
			maps_counter += 1;
		};
		
		const domain_triangle = domain_element.nextElementSibling;
		const domain_triangle_state = domain_triangle.innerText;
		
		if (searchString) {
			if ((domain_satisfies && domain_triangle_state == "▼") || (!domain_satisfies && domain_triangle_state == "▲")) {
				domain_triangle.click();
			};
		} else {
			if (domain_triangle_state == "▲") {
				domain_triangle.click();
			};
		};
	};
};

function createSectorIcon(size, sectors, borderColor, borderWidth) {
	var padding = borderWidth / 2;
	var adjustedSize = 50 + padding;
	var viewBoxSize = 2 * adjustedSize;	
		
	var svg = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-adjustedSize} ${-adjustedSize} ${viewBoxSize} ${viewBoxSize}" 
			 width="${size}" height="${size}">
	`;
	
	if (sectors.length == 1) {
		svg += `
			<circle cx="0" cy="0" r="${sectors[0].radius * 50}"
					fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />
		`;
	}

	var totalAngle = 0;
	sectors.forEach(function(sector) {
		var radius = sector.radius * 50
		var startAngle = totalAngle;
		var endAngle = totalAngle + sector.angle;

		var x1 = radius * Math.cos((startAngle * Math.PI) / 180);
		var y1 = radius * Math.sin((startAngle * Math.PI) / 180);
		var x2 = radius * Math.cos((endAngle * Math.PI) / 180);
		var y2 = radius * Math.sin((endAngle * Math.PI) / 180);

		var largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
		
		
		if (sectors.length > 1) {
			svg += `
				<path d="M 0,0 L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z"
					  fill="${sector.color}" fill-opacity="${sector.opacity}"
					  stroke="${borderColor}" stroke-width="${borderWidth / 2}" />
			`;
		} else {
			svg += `
				<path d="M 0,0 L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z"
					  fill="${sector.color}" fill-opacity="${sector.opacity}" />
			`;
		}
		

		totalAngle += sector.angle;
	});

	svg += `</svg>`;
	
	return L.divIcon({
		className: '',
		html: svg,
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2]
	});
};

function createMarker(sectors) {
	if (sectors.length) {
		var icon = createSectorIcon(16, sectors, 'white', 10)
	} else {
		var icon = L.divIcon({
			className: '',
			html: `
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
					<circle cx="10" cy="10" r="3" fill="black" />
				</svg>
			`,
			iconSize: [20, 20],
			iconAnchor: [10, 10]
		});
	};
	
	return icon;
};

function appendLegend(features_id, id, color, textstring) {
	var legend = document.getElementById("legend");
	
	var legend_item = document.createElement("div");
	legend_item.setAttribute("id", "legend_item_" + id);
	legend_item.classList.add("legend-item");
	
	var legend_color = document.createElement("div");
	legend_color.classList.add("legend-color");
	legend_color.style.backgroundColor = color;
	
	var color_input = document.createElement("input");
	color_input.setAttribute("type", "color");
	color_input.setAttribute("value", color);
	color_input.classList.add("color_input");
	
	legend_color.addEventListener("click", () => {
		color_input.click();
	});
	
	legend_color.addEventListener("mouseenter", () => {
		var pathes = document.querySelectorAll(`path[fill="${color}"]`)
		
		pathes.forEach(p => {
			p.setAttribute("fill", "#ffffff");
		});
	});
	
	legend_color.addEventListener("mouseleave", () => {
		var pathes = document.querySelectorAll(`path[fill="#ffffff"]`)
		
		pathes.forEach(p => {
			p.setAttribute("fill", color);
		});
	});
	
	color_input.addEventListener("change", (event) => {
		customColors.set(id, event.target.value);
		clear_all(false);
		show(features_id);
	});
	
	var span = document.createElement("span");
	const node = document.createTextNode(textstring);
	span.appendChild(node);
	
	legend_item.appendChild(color_input);
	legend_item.appendChild(legend_color);
	legend_item.appendChild(span);
	
	legend.appendChild(legend_item);
};

function buildLegend(features_id, palette) {
	var legend = document.getElementById("legend");
	
	var previous_id = -1
	
	for (const f in features_id) {
		var map_ = parents[features_id[f]];
		var map_id = map_[0];
		var map_text = map_[1];
		
		if (previous_id < map_id) {
			previous_id = map_id;
			var legend_map = document.createElement("span");
			legend_map.setAttribute("id", "legend_map_" + map_id);
			const legend_node = document.createTextNode(map_text);
			legend_map.appendChild(legend_node);
			
			legend.appendChild(legend_map);
		};
		
		appendLegend(features_id, features_id[f], palette[f], document.getElementById("feature_" + features_id[f]).innerText);
	}
	
	legend.style.display = "block";
};

function map_show(map_) {
	clear_all(true);
	
	var features_id = [];
	for (const child of map_.parentElement.nextElementSibling.children) {
		var id = parseInt(child.id.split('_')[1]);
		features_id.push(id);
	};
	
	show(features_id);
};

function feature_show(feature_button) {
	const is_pressed = feature_button.classList.contains("pressed");
	var id = parseInt(feature_button.id.split('_')[1]);
	
	if (is_pressed) {
		feature_button.classList.remove('pressed');
	} else {
		feature_button.classList.add('pressed');
	}
	
	var features_id = [];
	
	const pressed_buttons = document.querySelectorAll("button.pressed");
	pressed_buttons.forEach(b => {
		var button_id = parseInt(b.id.split('_')[1]);
		features_id.push(button_id);
	});
	
	const bool = (features_id.length > 0);
	clear_all(!bool);
	
	show(features_id);
};

async function show(features_id) {
	const [unique, inverse] = await get_values(features_id);
	const palette = [];
		
	for (const feature_id of features_id) {
		if (customColors.has(feature_id)) {
			palette.push(customColors.get(feature_id));
		} else {
			palette.push(colors[feature_id]);
		};
	};
	
	const icons = [];
	const legends = [];
	
	for (const uni of unique) {
		summa = uni.filter(element => element !== 0).length
		
		const sectors = [];
		const toLegend = [];
		
		for (const i in uni) {
			if (uni[i]) {
				const sector = { color: palette[i], angle: 360 / summa, opacity: 1, radius: uni[i]};
				sectors.push(sector);
				toLegend.push(document.getElementById("feature_" + features_id[i]).innerText);
			};
		};
				
		const icon = createMarker(sectors);
		icons.push(icon);
		legends.push(toLegend);
	};
	
	for (const i in villages_list) {
		const village_meta = villages_list[i]
		
		const number = village_meta["number"]
		const name = village_meta["name"]
		const district = village_meta["district"]
		const coords = village_meta["coords"]
		
		var features_legend = legends[inverse[i]]
		if (features_legend.length) {
			var bind_text = number + ") " + name + "<br>" + district + " р." + "<br>" + "(" + features_legend.join("; ") + ")"
		} else {
			var bind_text = number + ") " + name + "<br>" + district + " р." + "<br>"
		};
		
		bind_text = `
			<div>
				${bind_text}
				<div class=looks_like_link onclick="download_features(${i})">Загрузить список признаков</div>
			</div>
		`;
		
		var sectorMarker = L.marker(coords, {
			icon: icons[inverse[i]]
		}).addTo(map).bindPopup(bind_text);
		
		sectorMarker.getElement().setAttribute('id', `marker_${i}`);
	};
	
	if (features_id.length) {
		buildLegend(features_id, palette);
	};
};

function clear_all(strict) {
	if (strict) {
		buttons.forEach(b => {
			b.classList.remove("pressed");
		});
	}
	
	var legend = document.getElementById("legend");
	legend.style.display = "none";
	legend.innerHTML = '';
	
	var leaflet_marker_pane = document.getElementsByClassName("leaflet-marker-pane")[0];
	leaflet_marker_pane.innerHTML = '';
};

async function get_values(features_id) {
	const response = await fetch('/get_values', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({ features_id }),
	});
	
	const json = await response.json();
	const unique = json[0];
	const inverse = json[1];
	
	return [unique, inverse];
};

async function download_features(village_id) {
	const file_name = `${villages_list[village_id]["number"]}. ${villages_list[village_id]["name"]}, ${villages_list[village_id]["district"]} район.xlsx`
	
	const response = await fetch('/download_features', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({ village_id }),
	})
	.then(response => response.blob())
	.then(blob => {
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = file_name;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
	})
};

async function main() {
	
	map = L.map('map', {
		center: [54.14, 55.58],
		zoom: 6,
	});

	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	const villages_response = await fetch('/get_villages');
	villages_list = await villages_response.json();
	
	const features_response = await fetch('/get_features');
	features_list = await features_response.json();
	
	const colors_response = await fetch('/get_colors');
	colors = await colors_response.json();
	
	const polygons_response = await fetch('/get_polygons');
	polygons = await polygons_response.json();
	
	for (const polygon of polygons) {
		L.polygon(polygon, {
			color: 'black',
			fillOpacity: 0,
			weight: 1
		}).addTo(map);
	};
	
	buttons = document.querySelectorAll(".feature-button");
	for (const button_ of buttons) {
		var parent_ = button_.parentElement.previousElementSibling.children[0];
		var parent_id = parseInt(parent_.id.split("_")[1]);
		var parent_text = parent_.innerText;
		parents.push([parent_id, parent_text]);
	};

	show([]);
	
	const village_search_input = document.getElementById("village_search_input");
	const suggestionsList = document.getElementById("suggestionsList");
	const villages_data = [];
	for (const i in villages_list) {
		const village_obj = { "id": i, "meta": villages_list[i] };
		villages_data.push(village_obj);
	};
	
	village_search_input.addEventListener("input", function() {
		const query = village_search_input.value.toLowerCase();

		suggestionsList.innerHTML = "";

		if (query) {
			const filteredData = villages_data.filter(item => item["meta"]["name"].toLowerCase().includes(query));
			

			filteredData.forEach(item => {
				const li = document.createElement("li");
				li.textContent = item["meta"]["name"];

				li.addEventListener("click", function() {
					village_search_input.value = item["meta"]["name"];
					suggestionsList.innerHTML = "";
					
					map.setView(item["meta"]["coords"], 10);
					
					chosen_marker = document.getElementById(`marker_${item["id"]}`);
					chosen_marker.click();
				});

				suggestionsList.appendChild(li);
			});
		}
	});
	
	document.addEventListener("click", function(event) {
		if (!village_search_input.contains(event.target) && !suggestionsList.contains(event.target)) {
			suggestionsList.innerHTML = "";
		}
	});
};

let map;
let villages_list;
let features_list;
let colors;
let polygon;

let buttons;
let parents = [];

const customColors = new Map();

main();