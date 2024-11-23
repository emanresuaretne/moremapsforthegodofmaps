var map = L.map('map').setView([54.44, 55.58], 7);

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 60) {
        r = c; g = x; b = 0;
    } else if (h < 120) {
        r = x; g = c; b = 0;
    } else if (h < 180) {
        r = 0; g = c; b = x;
    } else if (h < 240) {
        r = 0; g = x; b = c;
    } else if (h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToRgb(hex) {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return null;
    return `rgb(${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)})`;
}

function generateColorPalette(count) {
    const colors = [];
    const step = 360 / count;

    for (let i = 0; i < count; i++) {
        const hue = Math.round(i * step);
        colors.push(hslToHex(hue, 70, 50));
    }

    return colors;
}

function toggleGroup(button) {
	const buttons = button.parentElement.nextElementSibling;
	buttons.classList.toggle('hidden');
	
	button.textContent = buttons.classList.contains('hidden') ? '▲' : '▼';
}

function createSectorIcon(size, sectors, borderColor, borderWidth) {
	var padding = borderWidth / 2;
	var adjustedSize = 50 + padding;
	var viewBoxSize = 2 * adjustedSize;	
		
	var svg = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-adjustedSize} ${-adjustedSize} ${viewBoxSize} ${viewBoxSize}" 
			 width="${size}" height="${size}">
	`;
	
	if (sectors.length <= 1) {
		svg += `
			<circle cx="0" cy="0" r="50"
					fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />
		`;
	}

	var totalAngle = 0;
	sectors.forEach(function(sector) {
		var startAngle = totalAngle;
		var endAngle = totalAngle + sector.angle;

		var x1 = 50 * Math.cos((startAngle * Math.PI) / 180);
		var y1 = 50 * Math.sin((startAngle * Math.PI) / 180);
		var x2 = 50 * Math.cos((endAngle * Math.PI) / 180);
		var y2 = 50 * Math.sin((endAngle * Math.PI) / 180);

		var largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
		
		
		if (sectors.length > 1) {
			svg += `
				<path d="M 0,0 L ${x1},${y1} A 50,50 0 ${largeArcFlag} 1 ${x2},${y2} Z"
					  fill="${sector.color}" fill-opacity="${sector.opacity}"
					  stroke="${borderColor}" stroke-width="${borderWidth}" />
			`;
		} else {
			svg += `
				<path d="M 0,0 L ${x1},${y1} A 50,50 0 ${largeArcFlag} 1 ${x2},${y2} Z"
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

function createMarker(coords, sectors, n, name, district) {
	if (sectors.length) {
		console.log(1);
		var icon = createSectorIcon(16, sectors, 'black', 10)
	} else {
		var icon = L.divIcon({
			className: '',
			html: `
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
					<circle cx="10" cy="10" r="5" fill="black" />
				</svg>
			`,
			iconSize: [20, 20],
			iconAnchor: [10, 10]
		});
	};
	
	var sectorMarker = L.marker(coords, {
		icon: icon
	}).addTo(map).bindPopup(n + ") " + name + "<br>" + district + " р.");
};

function appendLegend(color, textstring) {
	var legend = document.getElementById("legend");
	
	var legend_item = document.createElement("div");
	legend_item.classList.add("legend-item");
	
	var legend_color = document.createElement("div");
	legend_color.classList.add("legend-color");
	legend_color.style.backgroundColor = color;
	
	var span = document.createElement("span");
	const node = document.createTextNode(textstring);
	span.appendChild(node);
	
	legend_item.appendChild(legend_color);
	legend_item.appendChild(span);
	
	legend.appendChild(legend_item);
};

function buildLegend(features_id, first_id, palette) {
	var legend = document.getElementById("legend");
	for (const f of features_id) {
		appendLegend(palette[f - first_id], document.getElementById("feature_" + f).innerText);
	}
	legend.style.display = "block";
};

function map_show(map_id) {
	clear_all(true);
	
	var id = parseInt(map_id.split('_')[1]);
	var features = features_dict[id].features
	var features_id = [];
	for (const feature of features) {
		features_id.push(feature.id);
	};
	
	var palette = generateColorPalette(features_id.length);
	var first_id = features_id[0]
	
	show_few(features_id, first_id, palette);
};

function feature_show(feature_id) {
	var this_button = document.getElementById(feature_id);
	
	var features_id = [];
	
	var id = parseInt(feature_id.split('_')[1]);
	
	var sisters = this_button.parentElement.children;
	var first_sister = sisters[0]
	var first_id = parseInt(first_sister.id.split('_')[1]);
	var position = id - first_id;
	
	for (const sister of sisters) {
		var sister_color = window.getComputedStyle(sister).backgroundColor
		if (sister_color === hexToRgb("#1463b8")) {
			var sister_id = parseInt(sister.id.split('_')[1]);
			features_id.push(sister_id);
		}
	}
	features_id = [...new Set(features_id)]
	const bool = (features_id.length > 0)
	
	clear_all(!bool);
	
	var this_color = this_button.style.backgroundColor;
	if (this_color === hexToRgb("#007bff")) {
		this_button.style.backgroundColor = "#1463b8";
		features_id.push(id);
	} else {
		this_button.style.backgroundColor = "#007bff";
		features_id = features_id.filter(item => item !== id);
	}
	
	features_id = features_id.sort((a, b) => a - b)
	
	if (features_id.length) {
		var palette = generateColorPalette(sisters.length);
		show_few(features_id, first_id, palette);
	} else {
		show_all()
	};
};

function show_few(features_id, first_id, palette) {
	var range = [...Array(villages_numbers.length).keys()];
	for (const r of range) {
		var village_features = [];
		for (const f of features_id) {
			if (values[f][r]) {
				village_features.push(f);
			};
		};
		
		var village_info = villages_dict[r + 1];
		var sectors = [];
		for (const vf of village_features) {
			var sector = { color: palette[vf - first_id], angle: 360 / village_features.length, opacity: 0.5 };
			sectors.push(sector);
		};
		createMarker(village_info.coords, sectors, r + 1, village_info.name, village_info.district);
	};
	
	buildLegend(features_id, first_id, palette);
};

function show_all() {
	const buttons = document.querySelectorAll(".feature-button");
	buttons.forEach(b => {
		b.style.backgroundColor = "#007bff";
	});

	clear_all(true);
	
	Object.keys(villages_dict).forEach(function(v) {
		var village_info = villages_dict[v];
		var sectors = [];
		createMarker(village_info.coords, sectors, v, village_info.name, village_info.district);
	});
};

function clear_all(strict) {
	if (strict) {
		const buttons = document.querySelectorAll(".feature-button");
		buttons.forEach(b => {
			b.style.backgroundColor = "#007bff";
		});
	}
	
	var legend = document.getElementById("legend");
	legend.style.display = "none";
	legend.innerHTML = '';
	
	var leaflet_marker_pane = document.getElementsByClassName("leaflet-marker-pane")[0];
	leaflet_marker_pane.innerHTML = '';
};

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var villages_numbers = Object.keys(villages_dict);

show_all();