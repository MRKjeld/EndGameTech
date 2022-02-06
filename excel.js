const excelCtlr = function excelCtlr() {
    const rowsInGrid = 100;
    const colsInGrid = 100;

    /**
     * table object containing all cells and their respective attributes
     */
    const tableObject = {};

    /**
     * Generates the excel table.
     */
    const generateTable = function generateTable() {

    };

    /**
     * Destroys table and recreates it.
     */
    const refreshTable = function refreshTable() {

    };

    /**
     * Return a alphabet based on numerical value, ie: 25 = AA;
     * @param {integer} number 
     * @returns {string} letter
     */
    const getLetterFromNumber = function getLetterFromNumber(number) {

    };

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
};