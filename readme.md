#GSpreadsheet
##Usage
1. Load the script into your page thank you.
2. You're good to use it. Great job!
3. Create example `var example = new GSpreadsheet();`

##Reference
###GSpreadsheet
**findSheetById**( SheetID _String_ ) - Returns a GSheet modal or `false` if the SheetID is not found. This SheetID is the one from Google Spreadsheets such as the usual `od7`.

**findSheetByTitle**( SheetTitile _String_ ) - Returns an array of GSheet modals with the found title or `false` if not found.

**getInformation** - Return an object consisting of the `author`, `lastUpdated` and `title` of the given workbook.

**getSheets**( ArrayIndex _Integer [optional]_ ) - Returns the sheet at the given index or all of the sheets if not index is given.

**loadSheets**( onCompleteHandler _Function [optional]_, ParseNumbers _Boolean [optional]_ ) - Loads all the sheets related to the workbook. `onCompleteHandler` is fired when it has finished loading all the sheets. `ParseNumbers` is defaulted to `false` but ensures that any numbers in the cells are stored as numbers rather than strings.

**loadWorkbook**( TableKey _String_, onCompleteHandler _Function [optional]_ ) - Loads the given workbook from the key. `onCompleteHandler` is fired when load is completed.

###GSheet
**findRowsWith**(Searchworc _String/Regex [required]_, ToObject _Boolean [optional]_, ColumnIndex _Integer [optional]_) - Returns an array of either objects or arrays (dependant on ToObject being set to `true`, defaulted to `false`) that contained the search word.

**getHeaders** - Returns the headers/first row.

**getInformation** - Returns an object containing `id` and `title`.

**toArray**(RowIndex _Integer [optional]_) - Returns the rows; an array(columns) within array(rows).

**toObject**(RowIndex _Integer [optional]_) - Return an array of objects using the first row as headers/keys.