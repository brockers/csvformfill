var CSVFormFill = {

	glFileRows : new Array(),
	glRowCount : 0,
	glFormElements : new Array(),

	// Primary function call for opening our csv file
	onContextMenuCommand : function(event) {
		var file = this.chooseFile();
		if (file == null) {
			return;
		}

		var formValues = this.parseFile(file);
		this.populateRowList();

		var outputTitles = "";
		for(counter=0; counter<glFormElements.length;counter++) {
			outputTitles = outputTitles + " -- " + glFormElements[counter];
		}
		
		alert( glRowCount + " total rows imported from CSV \n" + outputTitles );
		
// 		this.fillForm(formValues);
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
// 	enableButton : function() {
// 		var button1 = document.getElementById("CSVFF-Previous-Button");
// 		var button2 = document.getElementById("CSVFF-Next-Button");
// 		var menu1 = document.getElementById("CSVFF-Select-Row-RowList");"
// 		button1.disabled = false;
// 		button2.disabled = false;
// 		menu1.disabled = false;
// 	},

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
			
			// Add the item to our menu
			menu.appendChild(tempItem);
		}
	},

	parseFile : function(file) {

		var formValues = {}, line = {};
		var cnt = 0;

		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(file, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		glFileRows = [];
		
		do {
			var hasMore = istream.readLine(line);
			if(cnt < 1) {
				glFormElements = line.value.split(/,/g);
				cnt++;
			} else {
				glFileRows.push(line.value);
			}
			
// 			if (line.value.indexOf('=') != -1) {
// 					var parts = line.value.split('=');
// 					formValues[parts[0]] = parts[1];
// 					//TODO: Maybe strip values?
// 			}
		} while (hasMore);

		istream.close();
	},

	fillForm : function(formValues) {
		var inputs = window.content.document.getElementsByTagName('input');

		for each (var input in inputs) {
			var name = input.getAttribute('name');

			if (name in formValues) {
					var type = input.getAttribute('type');
					if (type == 'text') {
						input.value = formValues[name];
					}
					//TODO: Handle other types than text, e.g. checkbox, radiobutton etc.

			}
		}
	}
};
