const excelCtlr = function excelCtlr() {
    const rowsInGrid = 100;
    const colsInGrid = 100;

    /**
     * REGEX
     */
    const REGEX_CELL_REFERENCE = /[A-z]+\d+/g;
    const REGEX_CELL_RANGE_REFERENCE = /([A-z]+\d+):([A-z]+\d+)/g;
    const REGEX_VALID_FORMULA = /^\(?[0-9]+(([+/*-][0-9]+)?\)?)+$/;
    
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
                        output: '',
                        dependents: []
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
        let cellId = evt.target.id;
        let cellInput = evt.target.value;        
        processCellData(cellId, cellInput);
    };

    /**
     * Handles all cell processing
     * @param {string} cellId 
     * @param {string} cellInput 
     * @returns 
     */
    const processCellData = function processCellData(cellId, cellInput) {
        updateCellInput(cellId, cellInput);

        if (isNonFormulaInput(cellInput)) {
            //set output to same as input and return
            updateCellOutput(cellId, cellInput);
            return;
        }
        debugger;
        let cellOutput = sanitizeFormula(cellInput);
        let referenceData = processCellReferenceData(cellOutput);
        updateReferencedDependents(cellId, referenceData.cellReferences);
        cellOutput = referenceData.processedOutput;
        cellOutput = (cellOutput) ? calculateStringArithmatic(cellOutput) : '';
        updateCellOutput(cellId, cellOutput);
        processDependentCellData(cellId);
    };

    /**
     * Finds dependents assigned to cell and updates them.
     * TODO: include a check for dependents chain to make sure that there's no looping dependencies.
     * @param {string} cellId 
     */
    const processDependentCellData = function processDependentCellData(cellId) {
        let dependents = tableObject[cellId].dependents;
        for (cell in dependents) {
            let dependentCell = tableObject[dependents[cell]];
            processCellData(dependents[cell], dependentCell.input);
        }
    };

    /**
     * Returns answer to input formula. Input must be a valid arithmatic operation.
     * @param {string} input 
     * @returns {number} answer
     */
    const calculateStringArithmatic = function calculateStringArithmatic(input) {
        if (!REGEX_VALID_FORMULA.test(input)) return 'Invalid Equasion';
        
        return eval(input); 
    };

    const updateReferencedDependents = function updateReferencedDependents(dependentCellId, referencedCellIds) {
        for (cell in referencedCellIds) {
            tableObject[referencedCellIds[cell]].dependents.push(dependentCellId);
        }
    }

    /**
     * 
     * @param {string} input
     * @returns {Object} 
     */
    const processCellReferenceData = function processCellReferenceData(input) {
        const cellRangeReferences = input.match(REGEX_CELL_RANGE_REFERENCE);
        const returnData = {
            processedOutput: input,
            cellReferences: []
        }
        for(cellRefIndex in cellRangeReferences) {
            returnData.processedOutput = input.replace(cellRangeReferences[cellRefIndex], getCellRange(cellRangeReferences[cellRefIndex]));
        }

        const cellReferences = returnData.processedOutput.match(REGEX_CELL_REFERENCE);
        for (cellRefIndex in cellReferences) {
            debugger;
            cellRef = cellReferences[cellRefIndex];
            cellValue = tableObject[cellRef.toUpperCase()].output || '';
            returnData.cellReferences.push(cellRef);
            returnData.processedOutput = returnData.processedOutput.replace(cellRef, cellValue);
        }

        return returnData;
    }

    /**
     * Sanitizes input string for processing. 
     * @param {string} input
     * @returns {string}
     */
    const sanitizeFormula = function sanitizeFormula(input) {
        input = input.substring(1);           //remove first letter (=)
        input = input.replaceAll(' ', '');   //remove any spaces
        return input;
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