const excelCtlr = function excelCtlr() {
    const rowsInGrid = 100;
    const colsInGrid = 100;

    /**
     * table object containing all cells and their respective attributes
     */
    const tableObject = {};

    /**
     * Generates the excel table using rowsInGrid x colsinGrid.
     */
    const generateTable = function generateTable() {
        let tableElement = document.createElement('table');
        tableElement.id = 'excelTable';
        for(let rowIndex = 0; rowIndex <= rowsInGrid; rowIndex++) {
            let newRow = tableElement.insertRow(rowIndex);

            for(let colIndex = 0; colIndex < colsInGrid; colIndex++) {
                let colName = getLetterFromNumber(colIndex);
                let cellName = colName + rowIndex;
                let cell = newRow.insertCell(colIndex);
                
                //set column names to top row.
                if (rowIndex === 0) {
                    cell.innerHTML = colName;
                    cell.classList.add('excelColHeader');
                    continue;
                }

                //configure and add input element in cell
                let inputElement = document.createElement('Input');
                inputElement.id = cellName;
                inputElement.setAttribute('type', 'text');
                inputElement.onblur = onCellBlur;
                inputElement.onfocus = onCellFocus;                
                
                //create object reference in tableObject if not found.
                if (!tableObject[cellName]) {
                    tableObject[cellName] = {
                        column: colIndex,
                        row: rowIndex,
                        input: '',
                        output: ''
                    };
                }

                cell.appendChild(inputElement);
            }
        }

        //fill in numbered cells left of grid.
        for (let i = 0; i < tableElement.rows.length; i++) {
            let numberedCell = tableElement.rows[i].insertCell(0);
            numberedCell.classList.add('excelRowHeader');
            //populate with row num if not 0
            if (i) numberedCell.innerHTML = i;
        }
        
        document.getElementById('main').appendChild(tableElement);
        console.log(tableObject);
    };

    /**
     * Destroys table and recreates it.
     */
    const refreshTable = function refreshTable() {
        alert("Not Implemented");
    };

    /**
     * Return a alphabet based on numerical value, ie: 25 = AA;
     * @param {integer} number 
     * @returns {string} letter
     */
    const getLetterFromNumber = function getLetterFromNumber(number) {
        const alphabet = [
            'A','B','C','D','E','F','G'
           ,'H','I','J','K','L','M','N'
           ,'O','P','Q','R','S','T','U'
           ,'V','W','X','Y','Z'
           ];

        if (number >= alphabet.length) {
        const timesDivisible = Math.floor(number / alphabet.length);
        const remainder = number - (timesDivisible * alphabet.length);
        return getLetterFromNumber(timesDivisible-1) + getLetterFromNumber(remainder);
        }

        return alphabet[number];
    };

    /**
     * Fires when cell loses focus
     * @param {OnBlurEvent} evt 
     */
    const onCellBlur = function onCellBlur(evt) {
        /**
         * Save input
         * Check for formula (starts with '=') (save output as )
         * 
         * Check formula dependents
         */
    }

    /**
     * Fires when cell gains focus
     * @param {OnFocusEvent} evt 
     */
    const onCellFocus = function onCellFocus(evt) {
    }

    /**
     * Runs startup code
     */
    const initialize = function initialize() {
        generateTable();
    };


    /**
     * contains all publicly available methods and attributes.
     */
    const publicApi = {
        initialize: initialize,
        refreshTable: refreshTable
    };

    return publicApi;
}();