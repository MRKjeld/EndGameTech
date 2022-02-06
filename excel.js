const excelCtlr = function excelCtlr() {
    const rowsInGrid = 100;
    const colsInGrid = 100;

    /**
     * REGEX
     */
    const REGEX_VALID_FORMULA = /^\(?[0-9]+([+/*-][0-9]+\)?)+$/;

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

                //if value already exists in table object, populate output.
                if (tableObject[cellName]) {
                    inputElement.value = tableObject[cellName].output;
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
     * Destroys and recreates table.
     */
    const refreshTable = function refreshTable() {
        destroyTable();
        generateTable()
    };

    /**
     * Destroy excelTable
     */
    const destroyTable = function destroyTable() {
        if (document.getElementById('excelTable')) {
            document.getElementById('excelTable').remove();
        }
    }

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
         * Check for formula (starts with '=')
         * Check formula references
         * Set as dependent on referenced cells
         * Replace cell references with values. 
         * Perform Arithmatic
         * 
         */
        let cellId = evt.target.id;
        let cellInput = evt.target.value;
        let cellElement = evt.target;
        updateCellInput(cellId, cellInput);

        if (isNonFormulaInput(cellInput)) {
            //set output to same as input and return
            updateCellOutput(cellId, cellInput);
            return;
        }
        let cellOutput = stripFirstLetter(cellInput);
        cellOutput = calculateStringArithmatic(cellOutput);
        updateCellOutput(cellId, cellOutput);
    }

    /**
     * Returns answer to input formula. Input must be a valid arithmatic operation.
     * @param {string} input 
     * @returns {number} answer
     */
    const calculateStringArithmatic = function calculateStringArithmatic(input) {
        if (!REGEX_VALID_FORMULA.test(input)) return 'Invalid Equasion';
        
        return eval(input); 
    };

    /**
     * Removes first letter of string. 
     * @param {string} string
     * @returns {string}
     */
    const stripFirstLetter = function stripFirstLetter(string) {
        return string.substring(1);
    }

    /**
     * checks where input is a valid formula, IE: has content or starts with a =
     * @param {string} cellInput 
     * @returns {boolean} isFormula
     */
    const isNonFormulaInput = function isNonFormulaInput(cellInput) {
        if (!cellInput) return true;
        if (cellInput.charAt(0) !== '=') return true;

        return false;
    };


    /**
     * Updates the tableObject's correlating cellId with the new input.
     * @param {string} cellId 
     * @param {string} cellInput 
     */
    const updateCellInput = function updateCellInput(cellId, cellInput) {
        tableObject[cellId].input = cellInput;
        console.log(tableObject[cellId]);
    }

    /**
     * Updates the tableObject's correlating cellId with the new output and refreshes element value.
     * @param {string} cellId 
     * @param {string} cellOutput 
     */
    const updateCellOutput = function updateCellOutput(cellId, cellOutput) {
        tableObject[cellId].output = cellOutput;
        document.getElementById(cellId).value = cellOutput;
    }

    /**
     * Fires when cell gains focus
     * @param {OnFocusEvent} evt 
     */
    const onCellFocus = function onCellFocus(evt) {
        let cellId = evt.target.id;
        evt.target.value = tableObject[cellId].input;
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