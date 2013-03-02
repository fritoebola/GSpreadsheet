;(function(window,undefined){

	function GSpreadsheet(){

		var _key = "",
			_sheets = [],
			_sheetsID = [],
			_infomation = {
				"author": "",
				"lastUpdated": "",
				"title": ""
			};

		function _injectScript(strURL){
			var scr = document.createElement("script");
				scr.type = "text/javascript";
				scr.src = strURL;

			document.getElementsByTagName("script")[0].parentNode.appendChild(scr);
		}

		return {
			"findSheetById": function(strID){
				strID += "";
				for(var a=0,len=_sheets.length; a<len; a++){
					if(_sheets[a].getInformation().id===strID){
						return _sheets[a];
					}
				}
				return false;
			},
			"findSheetsByTitle": function(strTitle){
				var retArr = [];
				for(var a=0,len=_sheets.length; a<len; a++){
					if(_sheets[a].getInformation().title===strTitle){
						retArr.push( _sheets[a] );
					}
				}
				if(retArr.length>0){
					return retArr;
				}
				return false;
			},
			"getInformation": function(){
				return _infomation;
			},
			"getSheets": function(){
				if(arguments.length===0){
					return _sheets;
				}
				return _sheets[+arguments[0]] || false;
			},
			"loadSheets": function(fnComplete,boolNumber){
				fnComplete = fnComplete || function(){};
				boolNumber = boolNumber || false;

				var intCounter = 0,
					strURLSheet = "",
					strCallback = "",
					self = this,
					len = _sheetsID.length;

				_sheets.length = 0;
				_sheets = Array(len);

				for(var a=0; a<len; a++){
					strCallback = "GScallback" + Date.now() + _sheetsID[a];
					strURLSheet = "https://spreadsheets.google.com/feeds/cells/" + _key + "/" + _sheetsID[a] + "/public/values?alt=json-in-script&callback=GSpreadsheet.callbacks." + strCallback;

					(function(index, cb){
						GSpreadsheet.callbacks[cb] = function(objJSON){
							_sheets[index] = new GSheet(_sheetsID[index], objJSON, boolNumber);
							
							intCounter++;

							if(intCounter===_sheetsID.length){
								fnComplete.call(self);
							}

							delete GSpreadsheet.callbacks[cb];
						};
					})(a, strCallback);

					_injectScript( strURLSheet );
				}
			},
			"loadWorkbook": function(strKey, fnComplete){
				fnComplete = fnComplete || function(){};
				_key = strKey;

				var strCallback = "GScallback" + Date.now(),
					strURLWorksheet = "https://spreadsheets.google.com/feeds/worksheets/" + _key + "/public/basic?alt=json-in-script&callback=GSpreadsheet.callbacks." + strCallback,
					self = this;

				GSpreadsheet.callbacks[strCallback] = function(objJSON){
					objJSON = objJSON.feed;

					//Information
					_infomation.author = objJSON.author[0].name.$t;
					_infomation.lastUpdated = new Date(objJSON.updated.$t);
					_infomation.title = objJSON.title.$t;

					var entries = objJSON.entry;
					for(var a=0; a<entries.length; a++){
						_sheetsID.push( entries[a].id.$t.match(/\/(\w+)$/i)[1] );
					}

					fnComplete.call(self);

					delete GSpreadsheet.callbacks[strCallback];
				};

				_injectScript(strURLWorksheet);

			}
		};
	}

	function GSheet(strID, objData, boolNumber){
		var _information = {
				"id": "",
				"title": ""
			},
			_rows = [];

		_information.id = strID;
		_information.title = objData.feed.title.$t;

		if(objData.feed.entry){
			var entries = objData.feed.entry,
				maxCols = +objData.feed.gs$colCount.$t,
				currentRowindex = 1,
				currentColIndex = 1,
				currentRow = [],
				cell = "",
				val = "";

			for(var a=0, len=entries.length; a<len; a++){
				cell = entries[a].gs$cell;
				val = cell.$t;

				if(boolNumber && !isNaN(val)){
					val = +val;
				}

				if(currentRowindex!==+cell.row){

					//Check we have the max amount of columns before adding
					if(currentRow.length!==maxCols){
						var diff = maxCols - currentRow.length;
						while(diff--){
							currentRow.push("");
						}
					}

					_rows.push( currentRow.slice(0) );
					currentRow.length = 0;
					currentRowindex = +cell.row;
					currentColIndex = 1;
				}

				if(currentColIndex!==+cell.col){
					var tmpCol = +cell.col,
						diff = tmpCol-currentColIndex;
					while(diff--){
						currentRow.push("");
					}
					currentColIndex = tmpCol;
				}

				currentRow.push( val );
				currentColIndex++;

			}

			if(currentRow.length>0){
				//Check we have the max amount of columns before adding
				if(currentRow.length!==maxCols){
					var diff = maxCols - currentRow.length;
					while(diff--){
						currentRow.push("");
					}
				}

				_rows.push( currentRow );
			}
			
		}

		function _toObject(arrRow, arrHeader){
			if(arrRow===undefined){
				return false;
			}

			var len = arrHeader.length,
				out = {},
				key = "";
			while(len--){
				key = arrHeader[len] || "";
				out[key] = arrRow[len];
			}
			return out;
		}

		return {
			"findRowsWith": function(search, boolObject, columnindex){
				var arrRows = [],
					row = null;

				if(Object.prototype.toString.call(search)!=="[object RegExp]"){
					search = new RegExp(search);
				}

				var a = 0,
					len = _rows.length;
				if(boolObject){
					a = 1;
				}
				for(; a<len; a++){
					if(columnindex===undefined){
						row = _rows[a].join(", ");
					} else {
						row = _rows[a][columnindex];	//Ensure it's a string
					}

					if(search.test(row)){
						row = _rows.slice(a,a+1)[0];
						if(boolObject){
							row = _toObject(row, _rows[0]);
						}
						arrRows.push( row );
					}
				}

				if(arrRows.length>0){
					return arrRows;
				}
				return false;
			},
			"getHeaders": function(){
				return _rows[0];
			},
			"getInformation": function(){
				return _information;
			},
			"toArray": function(){
				if(arguments.length===0){
					return _rows;
				}
				return _rows[+arguments[0]] || false;
			},
			"toObject": function(){
				var retArr = [],
					arrClone = _rows.slice(0),
					arrHeader = arrClone.splice(0,1)[0];

				if(arguments.length===0){
					//Do all rows
					for(var a=0, len=arrClone.length; a<len; a++){
						retArr.push( _toObject(arrClone[a], arrHeader) );
					}
				} else {
					//Do selected row
					retArr = _toObject( arrClone[+arguments[0]], arrHeader);
				}

				if(retArr!==false){
					return retArr;
				}
				return false;
			}
		};
	}

	window.GSpreadsheet = GSpreadsheet;
	window.GSpreadsheet.callbacks = {};
	
})(this);