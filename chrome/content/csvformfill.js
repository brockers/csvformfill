var CSVFormFill = {

	// Basically a list of names for each row to make it easy in the dropdown menu
	glFileRows : new Array(),
	// Count of the number of REAL rows in the selected CSV file
	glRowCount : 0,
	// Title row (first row) of the CSV.  Used for form selection input
	glFormElements : new Array(),
	// Our master array holding all the values for our CSV
	glMasterArray : new Array(),
	// Form elements by name so we don't have to do a for loop every time we want them
	glFormByName : new Array(),
	
	// Primary function call for opening our csv file
	onContextMenuCommand : function(event) {
		var file = this.chooseFile();
		if (file == null) {
			return;
		}

		this.parseFile(file);
		this.populateRowList();
		this.enableButton();
		
		alert( glRowCount + " total rows imported from CSV" );
		
		this.fillForm(0);
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

// 	disableButton : function() {
// 		var button1 = document.getElementById("CSVFF-Previous-Button");
// 		var button2 = document.getElementById("CSVFF-Next-Button");
// 		var menu1 = document.getElementById("CSVFF-Select-Row-RowList");"
// 		button1.disabled = true;
// 		button2.disabled = true;
// 		menu1.disabled = true;
// 	},
// 
	enableButton : function() {
		var button1 = document.getElementById("CSVFF-Previous-Button");
		var button2 = document.getElementById("CSVFF-Next-Button");
		var button3 = document.getElementById("CSVFF-View-File");
// 		var menu1 = document.getElementById("CSVFF-Select-Row-RowList");
		button1.disabled = false;
		button2.disabled = false;
		button3.disabled = false;
// 		menu1.disabled = false;
	},

	// Populate our list of CSV rows so we can select a row to enter
	populateRowList : function() {
		// Get the toolbaritem "menu" that we added to our XUL markup
		var menu = document.getElementById("CSVFF-Select-Row-RowList-Menu");
		
		// Remove all of the items currently in the popup menu
		for(var i=menu.childNodes.length - 1; i >= 0; i--) {
			menu.removeChild(menu.childNodes.item(i));
		}
		
		// Specify how many items we should add to the menu
// 		var numItemsToAdd = 10;
		glRowCount = glFileRows.length;
		
		for(var i=0; i<glRowCount; i++) {
			// Create a new menu item to be added
			var tempItem = document.createElement("menuitem");
			var rowValue = glFileRows[i];
			
			// Set the new menu item's label
			tempItem.setAttribute("label", rowValue );
			tempItem.setAttribute("value", i );
			
			// Add the item to our menu
			menu.appendChild(tempItem);
		}
	},

	parseFile : function(file) {

// 		var formValues = {};
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
				glFormElements = line.value.split(/,/g);
				formElementNumber = glFormElements.length;
				cnt=0;
			} else {
				// Get all the values split on a given row
				var tempArray = line.value.split(/,/g);
				// Set the name for each row (we will still used an ordered array for logic internally)
				glFileRows.push(tempArray[0]);

				glMasterArray[cnt] = [];
				var copyArray = [];
				
				//create or master array
				for(csvColumnNum=0;csvColumnNum<formElementNumber;csvColumnNum++) {
					var colName = glFormElements[csvColumnNum];
					// DEBUG
// 					alert("Name " + colName + " Column Number " + csvColumnNum + " Number Count " + cnt);
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
			
// 			if (line.value.indexOf('=') != -1) {
// 					var parts = line.value.split('=');
// 					formValues[parts[0]] = parts[1];
// 					//TODO: Maybe strip values?
// 			}
		} while (hasMore);

		istream.close();
	},

	fillForm : function(row) {

		// Text forms make up the majority.  Fill them out first.
		var inputs = window.content.document.getElementsByTagName('input');
		// Process all out text input data.
		for(var t=0;t<inputs.length;t++) {
			var name = inputs[t].getAttribute('name');
			// DEBUG
// 			alert(name);
			if (name in glFormByName) {
				var colNum = glFormByName[name];
				var type = inputs[t].getAttribute('type');
				if (type == 'text') {
					inputs[t].value = glMasterArray[row][colNum];
				}
			}
		}

		// Select boxes are our next priority.
		var selects = window.content.document.getElementsByTagName('select');
		// Process all our select boxes
// 		for each (var selt in selects) {
		for(var t=0;t<selects.length;t++) {
			var name = selects[t].getAttribute('name');

			if (name in glFormByName) {
				var colNum = glFormByName[name];
				var arrValName = glMasterArray[row][colNum];
				this.testSelects(selects[t], arrValName);
			}
		}

		// Selects textarea elements and populates thier fields
		var txtareas = window.content.document.getElementsByTagName('textarea');
		//Process all our textareas
		for(var t=0;t<txtareas.length;t++) {
			var name = txtareas[t].getAttribute('name');
			// DEBUG
			// 			alert(name);
			if (name in glFormByName) {
				var colNum = glFormByName[name];
				txtareas[t].value = glMasterArray[row][colNum];
			}
		}
		
	},

	// Provide a quick way to view the current csv file as it is seen by the array.
	viewFile : function() {

		var outputTitles = "";
		for(counter=0; counter<glFormElements.length;counter++) {
			outputTitles += "<td>" + glFormElements[counter] + "</td>";
		}

		// Display actual document window.
		var progressWindow = window.open("","","top=10,left=10,height=200,width=500");
		progressWindow.document.write("<html><head></head><body><div id='progressArea'></div></body></html>");

		var progressArea = progressWindow.document.getElementById("progressArea");
		progressArea.innerHTML="<tr>"+outputTitles+"</tr>";
	},

	// Move some of the convoluted selection box option code into it's own fuction... faster too.
	testSelects : function(s,v) {
		for ( var i = 0; i < s.options.length; i++ ) {
			if ( s.options[i].value == v ) {
				s.options[i].selected = true;
				return;
			}
		}
	}
};
