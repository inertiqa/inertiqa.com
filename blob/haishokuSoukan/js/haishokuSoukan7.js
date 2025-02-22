const dbName = "colorsDB";
var db = null; 
var callback; // Se ejecuta luego de que la base de datos ha sido inicilizada
var param = null; // Parametro del callback
//var sessionUserKey = 'user';
var colorQuery;

/*
function getSession() {
	var loggedUser = sessionStorage.getItem(sessionUserKey);
	if(loggedUser){return loggedUser}
	else{return false}
}

function setSession(user) {
  sessionStorage.setItem(sessionUserKey, user);
  window.location.href = "./";
}

function deleteSession() {
  sessionStorage.clear();
  window.location.href = "./";
}


function login(callback) {
	var userName = document.getElementById("formName").value;
	var pass = document.getElementById("formPass").value;

	var tx = db.transaction(["users"], "readonly");
	var storage = tx.objectStore("users");
	var req = storage.get(userName)

	req.onsuccess = function(e) {
		var user = e.target.result;
		if(!user) {
			return alert('User not found');
		} else {
			if(pass !== user["pass"]) {
				return alert('User password don\'t match');
			} else {
				sessionStorage.setItem(sessionUserKey, user["name"]);
				window.location.href = './';
			}
		}
	}
}

function checkUserBeforeInsert(user) {
	var tx = db.transaction(["users"], "readonly");
	var storage = tx.objectStore("users");
	var req = storage.get(user["name"])

	req.onsuccess = function(e) {
		var userFound = e.target.result;
	if(!userFound) {
		insertInto('users', user);
		window.location.href = "./";  
	} else {
		alert('User already exists');
    }
  }
}

function register() {
	var userName = document.getElementById("formName").value;
	var userEmail = document.getElementById("formEmail").value;
	var pass = document.getElementById("formPass").value;
	var userModel = {
		name : userName,
		email : userEmail,
		pass : pass
	}
	checkUserBeforeInsert(userModel)
}
*/

function initDB() {
	var connection = indexedDB.open(dbName, 1);
	connection.onsuccess = function(e) { // Se definen callbacks
		db = e.target.result;
		console.log(db)
		navigate('listColors')
	}

	connection.onupgradeneeded = function(e) {
		db = e.target.result;
		db.createObjectStore('colors', {keyPath: 'color_name'}).createIndex('color', 'color', {unique: true});
		db.createObjectStore('colors_combination', {keyPath: 'comb_name'});
		db.createObjectStore('users', {keyPath: 'name'});
		navigate('listColors')
	}
}

function getDefaultData() {
	$.ajax({url : 'https://ooqq.me/blob/haishokuSoukan/DDBB.json'}).done(data => {populateDB(data)})
}

function populateDB(data) {
	var colors = data["DDBB"][0]['colores'];
	var combs = data["DDBB"][1]['combinaciones'];
	//var users = data["DDBB"][2]['usuarios'];
	console.log(data);

	for(var color of colors) {
		var fixedColor = {
			color : color["hexValue"],
			color_name : color["colorName"]
		}
		insertInto('colors', fixedColor);
	}

	var combN = 0;
	for(var comb of combs) {
		combN++;
		var fixedComb = {
			hex1 : null,
			hex2 : null,
			hex3 : null,
			hex4 : null,
			comb_name : 'Combination' + combN
		}

	for(var i in comb["combinacionElementos"]) {
		var colorName = comb["combinacionElementos"][i]['colorName'];
		fixedComb['hex' + (parseInt(i) + 1)] = colorName;
	}

    console.log(fixedComb);
    insertInto('colors_combination', fixedComb);
	}

	//for(var user of users) {
	//	insertInto('users', user);
	//}
}

function insertInto(table, obj) {
	var tx = db.transaction([table], "readwrite");
	var storage = tx.objectStore(table);
	var save = storage.add(obj);
}

///////////////////
//////// Color CRUD
function insertColor() {
	insertInto('colors', serializeColorForm());
}

function serializeColorForm() {
	var color = document.getElementById("color").value;
	var color_name = document.getElementById("color_name").value;
	return {
		color : color,
		color_name : color_name
	}
}

function readColors(db, viewController) {
	var tx = db.transaction(["colors"], "readonly");
	var storage = tx.objectStore("colors");
	var cursor = storage.openCursor();
	cursor.addEventListener("success", viewController, false)
}

function listColors(e) {
	if(e.target.result) {
		const row = e.target.result.value;
		var el = document.getElementById("color_list");
		var str = `
			<button title="${row.color_name}"

			class="color-item"
			style="${row.color_name === 'white' ? 'border:1px solid black' : ''};background-color:${row.color};" 
			value="${row.color}">
			</button>`;
		el.innerHTML += str;
		e.target.result.continue();
	} else {
		$('.color-item').click(function(e) {
			e.preventDefault();
			var colorName = $(this).attr('title');
			colorQuery = colorName;
			navigate('searchCombination');
    });
	}
}

function listColorOption(e) {
	if(e.target.result) {
		const row = e.target.result.value;
		var str = "";
		str += '<option label="';
		str += row.color_name;
		str += '" style="';
		str +=  'color:';
		str += row.color_name === 'white' ? 'black;' : row.color;
		str += '" value="';
		str += row.color_name;
		str += '"></option>';
		$('.select-color').each((idx, el) => {
			el.innerHTML += str;
		});
		e.target.result.continue();
	}
}

function updateColor() {
	var color_name_old = document.getElementById("color_name_old").value;
	var updateModel = {
		color : document.getElementById("color").value,
		color_name : document.getElementById("color_name_new").value
	}
	var tx = db.transaction(["colors"], "readwrite");
	var storage = tx.objectStore("colors");
	var del = storage.delete(color_name_old);

	del.addEventListener('success', () => insertInto('colors', updateModel), false)
}

function deleteColor() {
	var color = document.getElementById("color").value;
	var tx = db.transaction(["colors"], "readwrite");
	var storage = tx.objectStore("colors");
	var del = storage.delete(color);
}

/////////////////////////
//////// Combination CRUD
function insertCombination() {
	insertInto('colors_combination', serializeCombForm());
}

function serializeCombForm() {
	var comb_name = document.getElementById("comb_name").value;
	var hex1 = document.getElementById("hex1").value;
	var hex2 = document.getElementById("hex2").value;
	var hex3 = document.getElementById("hex3").value;
	var hex4 = document.getElementById("hex4").value;
	return {
		hex1 : hex1,
		hex2 : hex2,
		hex3 : hex3,
		hex4 : hex4,
		comb_name : comb_name   
	}
}

/////////////////////////
//////// Combination read
var colorsArr = [];

function combSearch(db) {
	var tx = db.transaction(["colors"], "readonly");
	var storage = tx.objectStore("colors");

	var cursor = storage.getAll(); //Primero cogemos los colores
	cursor.addEventListener("success", getCombs, false)
}

function getCombs(e) {
	if(typeof e.target.result == 'object') {
	colorsArr = e.target.result;
	var tx = db.transaction(["colors_combination"], "readonly");
	var storage = tx.objectStore("colors_combination");
	var cursor = storage.getAll();
	cursor.addEventListener("success", listCombs, false);
	}
}

function listCombs(e) {
	console.log(e)
	if(typeof e.target.result == 'object') {
		var colorsCombArr = e.target.result.filter(row =>
			row["hex1"] === colorQuery ||
			row["hex2"] === colorQuery ||
			row["hex3"] === colorQuery ||
			row["hex4"] === colorQuery
		);
		var i = 1;
		var element = document.getElementById('comb_list');
		for(var comb of colorsCombArr) {
			var color1 = colorsArr.find(c => c["color_name"] === comb["hex1"]);
			var hex1 = color1 ? color1["color"] : null;
			var cName1 = comb["hex1"];

			var color2 = colorsArr.find(c => c["color_name"] === comb["hex2"]);
			var hex2 = color2 ? color2["color"] : null;
			var cName2 = comb["hex2"];

			var color3 = colorsArr.find(c => c["color_name"] === comb["hex3"]);
			var hex3 = color3 ? color3["color"] : null;
			var cName3 = comb["hex3"];

			var color4 = colorsArr.find(c=>c["color_name"] === comb["hex4"]);
			var hex4 = color4 ? color4["color"] : null;
			var cName4 = comb["hex4"];

		element.innerHTML += renderComb(hex1, cName1, hex2, cName2, hex3, cName3, hex4, cName4, i);
		i++;
		}
	}
}

function renderComb(hex1, cName1, hex2, cName2, hex3, cName3, hex4, cName4, i) {
	if(hex3 == null && hex4 == null) { //solo dos colores
		return `<div class="colors2">
		<div>${i}</div>
		<div style="background-color:${hex1}"></div>
		<div style="border-top:50px solid ${hex1}; border-right:100px solid transparent"></div>
		<div style="border-bottom:50px solid ${hex2}; border-left:100px solid transparent"></div>
		<div style="background-color:${hex2}"></div>
		<div>${cName1}</div>
		<div></div>
		<div>${cName2}</div>
		</div>`;
	}

	if(hex4 == null ) { //solo tres colores
		return `<div class="colors3">
		<div>${i}</div>
		<div style="background-color:${hex1}"></div>
		<div style="background-color:${hex2}"></div>
		<div style="background-color:${hex3}"></div>
		<div>${cName1}</div>
		<div>${cName2}</div>
		<div>${cName3}</div>
		</div>`;
	}

		return `<div class="colors4">
		<div>${i}</div>
		<div style="background-color:${hex1}"></div>
		<div style="background-color:${hex2}"></div>
		<div style="background-color:${hex3}"></div>
		<div style="background-color:${hex4}"></div>
		<div>${cName1}</div>
		<div>${cName2}</div>
		<div>${cName3}</div>
		<div>${cName4}</div>
		</div>`;
}

function deleteComb() {
	var comb = document.getElementById("comb").value;
	var tx = db.transaction(["colors_combination"], "readwrite");
	var storage = tx.objectStore("colors_combination");
	var del = storage.delete(comb);
}


function navigate(seccion, callback) { //TEMPLATES
	var url = `./templates/${seccion}.html`;
	$('#main').load(url, callback);
}

$(document).ready(function() {
	$('.nav-link').click(function(e) {
		e.preventDefault();
		var dir = $(this).attr("href");
		navigate(dir);
	})
})

window.addEventListener("load", initDB, false); // Se iniciliza la db al cargar el DOM
