var CSVFormFill = {

	// Basically a list of names for each row to make it easy in the dropdown menu
	glFileRows : [],
	// Count of the number of REAL rows in the selected CSV file
	glRowCount : 0,
	// Title row (first row) of the CSV.  Used for form selection input
	glFormElements : [],
	// Our master array holding all the values for our CSV
	glMasterArray : [],
	// Form elements by name so we don't have to do a for loop every time we want them
	glFormByName : [],

	// TODO: Disable arrow keys when they reach beginning/ending of the file.
	
	// Primary function call for opening our csv file
	onContextMenuCommand : function(event) {
		"use strict";
		var file = this.chooseFile();
		if (file === null) {
			return;
		}

		this.parseFile(file);
		this.populateRowList();
		this.enableButton();
		
		alert( "Total rows imported: " + glRowCount );

		// This is here to autopopulate the first item, but I don't know if I want it.
		// this.fillForm(0);
	},

	// File Choosign Dialog
	chooseFile : function() {

		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, "Select a File", nsIFilePicker.modeOpen);
		fp.appendFilter("CSV Text File (*.csv, *.txt)","*.csv; *.txt");

		var res = fp.show();

		if (res == nsIFilePicker.returnOK) {
			return fp.file;
		} else {
			return null;
		}
	},

	// Enable the buttons after the first CSV is loaded.
	enableButton : function() {
		var button1 = document.getElementById("CSVFF-Previous-Button");
		var button2 = document.getElementById("CSVFF-Next-Button");
// 		var button3 = document.getElementById("CSVFF-View-File");

		button1.disabled = false;
		button2.disabled = false;
// 		button3.disabled = false;
	},

	// Populate our list of CSV rows so we can select a row to enter
	populateRowList : function() {
		// Get the toolbaritem "menu" that we added to our XUL markup
		var i = 0;
		var menu = document.getElementById("CSVFF-Select-Row-RowList-Menu");
		
		// Remove all of the items currently in the popup menu
		for(i=menu.childNodes.length - 1; i >= 0; i--) {
			menu.removeChild(menu.childNodes.item(i));
		}
		
		// Specify how many items we should add to the menu
		glRowCount = glFileRows.length;
		
		for(i=0; i<glRowCount; i++) {
			// Create a new menu item to be added
			var tempItem = document.createElement("menuitem");
			var rowValue = glFileRows[i];
			
			// Set the new menu item's label
			tempItem.setAttribute("label", rowValue );
			tempItem.setAttribute("value", i );
			tempItem.setAttribute("oncommand", "CSVFormFill.fillForm(" + i +")");
			
			// Add the item to our menu
			menu.appendChild(tempItem);
		}
	},

	// Put all our change button logic in one place.
	// This may not be the best way but it behaves the way I want.
	changRowInList : function( direction ){

		// Find out what is currently selected... and grab it.
		var menu = document.getElementById("CSVFF-Select-Row-RowList");
		// Find out what the currently selected number is.
		var selIndex = menu.selectedIndex;

		if (typeof selIndex === 'number') {
			// Update our number to the next index
			(direction === 'up') ? (selIndex++) : (selIndex--);
			// Now lets make our change.
			if(selIndex >= glRowCount) {
				this.fillForm(glRowCount-1);
				menu.selectedIndex = (glRowCount-1);
			} else if (selIndex <= 0) {
				this.fillForm(0);
				menu.selectedIndex = 0;
			} else {
				this.fillForm(selIndex);
				menu.selectedIndex = selIndex;
			}
		} else {
			// Var was probably undefined. Set to 0
			this.fillForm(0);
			menu.selectedIndex = 0;
		}
	},

	// Parse our CSV files line by line and pass to our splitter function.
	parseFile : function(file) {

		var line = {};
		var cnt = 9999;
		var formElementNumber = 0;

		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(file, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		glFileRows = [];
		glMasterArray = [];
		glFormByName = {};
		
		do {
			var hasMore = istream.readLine(line);
			if(cnt == 9999) {
// 				glFormElements = line.value.split(/,/g);
				glFormElements = line.value.splitCSV();
				formElementNumber = glFormElements.length;
				cnt=0;
			} else {
				// Get all the values split on a given row
// 				var tempArray = line.value.split(/,/g);
				var tempArray = line.value.splitCSV();
				// Set the name for each row (we will still used an ordered array for logic internally)
				glFileRows.push(tempArray[0]);

				glMasterArray[cnt] = [];
				var copyArray = [];
				
				//create or master array
				for(csvColumnNum=0;csvColumnNum<formElementNumber;csvColumnNum++) {
					var colName = glFormElements[csvColumnNum];
					// DEBUG
					// alert("Name " + colName + " Column Number " + csvColumnNum + " Number Count " + cnt);
					copyArray[csvColumnNum] = tempArray[csvColumnNum];
				}
				glMasterArray[cnt] = copyArray;
				cnt++;
			}

			// we know the names we want... now we just need the numbers.
			for(j=0;j<formElementNumber;j++) {
				var tmpName = glFormElements[j];
				glFormByName[tmpName] = j;
			}
			// Next line of CSV
		} while (hasMore);

		istream.close();
	},

	changeInput : function(name, input, row) {
		var colNum = glFormByName[name];
		var type = input.getAttribute('type');
		if (type == 'text') {
			if(input.value != glMasterArray[row][colNum]) {
				input.value = glMasterArray[row][colNum];
				input.style.background = '#72A4D2';
			} else {
				input.style.background = '';
			}
		}
	},

	changeSelect : function(name, select, row){
		var colNum = glFormByName[name];
		var arrValName = glMasterArray[row][colNum];
		var findMatch = this.testSelects(select, arrValName);
		if(findMatch == 1){
			select.style.background = '#72A4D2';
		} else if(findMatch == 2) {
			select.style.background = '';
		} else {
			select.style.background = '#FF7654';
		}
	},

	changeTxtArea : function(name, txtarea, row){
		var colNum = glFormByName[name];
		if(txtarea.value != glMasterArray[row][colNum]) {
			txtarea.value = glMasterArray[row][colNum];
			txtarea.style.background = '#72A4D2';
		} else{
			txtarea.style.background = '';
		}
	},
	
	// This is where we actually put our CSV row into the form.
	// Form elements that are not named are ignored as are
	// CSV elements that are not present in the form.
	fillForm : function(row) {
		"use strict";
		var t = 0;

		// Text forms make up the majority.  Fill them out first.
		var inputs = window.content.document.getElementsByTagName('input');
		// Process all out text input data.
		for(t=0;t<inputs.length;t++) {
			// Default to looking for the id, as it is guarenteed unique
			var mId = inputs[t].getAttribute('id');
			// DEBUG
			// alert(name);
			if (mId in glFormByName) {
				this.changeInput(mId, inputs[t], row);
			} else {
				// Cannot find id, check for a name
				var mName = inputs[t].getAttribute('name');
				if (mName in glFormByName){
					this.changeInput(mName, inputs[t], row);	
				} else {
					inputs[t].style.background = '#D2A472';
				}
			}
		}

		// Select boxes are our next priority.
		var selects = window.content.document.getElementsByTagName('select');
		// Process all our select boxes
		for(t=0;t<selects.length;t++) {
			// Default look for id
			var mId = selects[t].getAttribute('id');

			if (mId in glFormByName) {
				this.changeSelect(mId, selects[t], row);
			} else {
				// Cannot find id, see if we have a matching name
				var mName = selects[t].getAttribute('name');
				if (mName in glFormByName) {
					this.changeSelect(mName, selects[t], row);	
				} else {
					selects[t].style.background = '#D2A472';
				}
			}
		}

		// Selects textarea elements and populates thier fields
		var txtareas = window.content.document.getElementsByTagName('textarea');
		//Process all our textareas
		for(t=0;t<txtareas.length;t++) {
			var mId = txtareas[t].getAttribute('id');
			// DEBUG
			// alert(name);
			if (mId in glFormByName) {
				this.changeTxtArea(mId, txtareas[t], row);
			} else {
				if (mName in glFormByName){
					// No id see if we have a name that matches
					var mName = txtareas[t].getAttribute('name');
					this.changeTxtArea(mName, textareas[t], row);
				} else {
					txtareas[t].style.background = '#D2A472';
				}
			}
		}
	},

	// Provide a quick way to view the current csv file as it is seen by the array.
	// TODO: display a CSV table as seen my the plugin (window.open doesn't currently work)
	viewFile : function() {
		"use strict";

		var outputTitles = "";
		var counter = 0;
		for(counter=0; counter<glFormElements.length;counter++) {
			outputTitles += "<td>" + glFormElements[counter] + "</td>";
		}

		// Display actual document window.
		var progressWindow = window.open("chrome://csvformfill/content/csvlayout.htm","","top=10,left=10,height=200,width=500");
		var innerDiv = progressWindow.document.getElementById("csvtablearea");
		innerDiv.innerHTML = "<div>hello world!!</div>";
		// 		progressWindow.document.write("");

// 		var progressArea = progressWindow.document.getElementById("progressArea");
// 		progressArea.innerHTML="<tr>"+outputTitles+"</tr>";
	},

	// Move some of the convoluted selection box option code into it's own fuction... faster too.
	testSelects : function(s,v) {
		// DEBUG
// 		alert("option value is --" + v + "--");
		for ( var i = 0; i < s.options.length; i++ ) {
			// DEBUG
// 			alert("Loop next value is --" + s.options[i].value + "-- and the text is --" + s.options[i].text.toUpperCase() + "--");
			if ( s.options[i].value == v ) {
				if(s.selectedIndex == i) {
					return 2;
				} else {
					s.options[i].selected = true;
					return 1;
				}
			} else if(s.options[i].text.toUpperCase() == v.toUpperCase()) {
				if(s.selectedIndex == i) {
					return 2;
				} else {
					s.options[i].selected = true;
					return 1;
				}
			}
		}
		// Entire list was searched with no current value
		return 3;
	}
};

// Protype of a string function to to CSV splits per line.  
String.prototype.splitCSV = function(sep) {
	for (var foo = this.split(sep = sep || ","), x = foo.length - 1, tl; x >= 0; x--) {
		if (foo[x].replace(/"\s+$/, '"').charAt(foo[x].length - 1) == '"') {
			if ((tl = foo[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
				foo[x] = foo[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
			} else if (x) {
				foo.splice(x - 1, 2, [foo[x - 1], foo[x]].join(sep));
			} else foo = foo.shift().split(sep).concat(foo);
		} else foo[x].replace(/""/g, '"');
	} return foo;
};
