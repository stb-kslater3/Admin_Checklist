import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import Id from '@salesforce/user/Id';

import queryFromString from '@salesforce/apex/ApexDataInterface.queryFromString';
import updateRecordFromId from '@salesforce/apex/ApexDataInterface.updateRecordFromId';
import insertRecord from '@salesforce/apex/ApexDataInterface.insertRecord';
import getObjectDefaults from '@salesforce/apex/ApexDataInterface.getObjectDefaults';

import createAdminGroup from '@salesforce/apex/AdminChecklist_Controller.createAdminGroup';
import downloadAdmin from '@salesforce/apex/AdminChecklist_Controller.downloadAdmin';


class LWC_Toast {
    thisReference;

    constructor(thisReference) {
        this.thisReference = thisReference;
    }

    displayChoice(title, message, variant, mode) {
        const toast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });

        this.thisReference.dispatchEvent(toast);
    }

    displaySuccess(title, message) {
        const toast = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'success',
            mode: 'sticky'
        });

        this.thisReference.dispatchEvent(toast);
    }

    displayError(title, userMessage, error) {
        const errorToast = new ShowToastEvent({
            title: title,
            message: userMessage,
            variant: 'error',
            mode: 'sticky'
        });

        let errorMessage;
        if(error.body) {
            errorMessage = error.body.message;
        }else {
            errorMessage = error.message;
        }
        console.log(userMessage, '\n\n' + errorMessage, '\nOn Line: ' + error.lineNumber, '\nIn File: ' + error.fileName, '\n\nStack Trace: ' + error.stack, '\n');

        this.thisReference.dispatchEvent(errorToast);
    }
}


class Attribute_Handler {
    attributeType;

    constructor(attributeType) {
        this.attributeType = attributeType;
    }

    getAttribute(element, attribute) {
        let value = element[attribute];

        if(this.attributeType === 'number' || this.attributeType === 'currency') {
            return Number(value)
        }else {
            return value;
        }
    }


    setAttribute(element, attribute, value) {
        element[attribute] = value;
    }
}


class LWC_Element {
    // The Id used to query the dom for this specific element
    dataId;

    // So that I can access the this of the Element
    templateReference;

    // The reference to the dom element itself so its attributes can be read and written to and
    // event listeners added, etc.
    domElement;

    // To ensure the dom is queried only once, since renderedCallback is run multiple times
    isInitialized;

    apiFieldName;


    // Because Javascript has crappy typing, I need this to get number rather than string back and 
    // those sorts of things. Otherwise getting values concatenates numbers etc.
    attributeHandler;


    constructor(dataId, templateReference, attributeHandler) {
        this.dataId = dataId;

        this.isInitialized = false;

        this.templateReference = templateReference;

        this.attributeHandler = attributeHandler;
    }


    setApiFieldName(fieldName) {
        this.apiFieldName = fieldName;
    }


    initialize() {
        this.domElement = this.templateReference.querySelector("[data-id='" + this.dataId + "']");

        this.isInitialized = true;
    }


    getAttribute(name) {
        return this.attributeHandler.getAttribute(this.domElement, name);
    }

    setAttribute(name, value) {
        this.attributeHandler.setAttribute(this.domElement, name, value);
    }
}


class LWC_Input_Element extends LWC_Element {
    // The callback function that handles Changes
    changeHandler;

    constructor(dataId, templateReference, attributeHandler, changeHandler) {
        super(dataId, templateReference, attributeHandler);

        this.changeHandler = changeHandler;
    }


    initialize() {
        // Note that I call the protype method so I need to bind this context to access my properties
        LWC_Element.prototype.initialize.call(this);

        this.domElement.addEventListener('change', this.handleChange.bind(this));
    }


    handleChange(event) {
        /*
        if(this.getAttribute('value')) {
            console.log(this.getAttribute('value'));
        }else {
            console.log(this.getAttribute('checked')); 
        }
        */

        this.changeHandler(event);
    }
}



var saveBlob = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (blob, fileName) {
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());



export default class Admin_checklist extends LightningElement {
    currentUser = Id;

    adminChosen;

    hasSearchResults;
    searchResults;

    toastHandler;

    lookUpQuote_elements;

    whoWhat_elements;
    fetCredit_elements;
    tradeIn_elements;
    finances_elements;

    defaultAdminChecklist;

    arbitraryAttributeHandler;
    numberAttributeHandler;
    currencyAttributeHandler;


    calculateTotalBeforeProfit() {
        this.finances_elements.finances_Subtotal_Before_Profit.setAttribute(
            'value', 

            this.finances_elements.finances_PO1_Cost.getAttribute('value') +
            this.finances_elements.finances_PO2_Cost.getAttribute('value') +
            this.finances_elements.finances_PO3_Cost.getAttribute('value') +
            this.finances_elements.finances_PO4_Cost.getAttribute('value') +
            this.finances_elements.finances_PO5_Cost.getAttribute('value') +
            this.finances_elements.finances_PO6_Cost.getAttribute('value') +
            this.finances_elements.finances_PO7_Cost.getAttribute('value') +
            this.finances_elements.finances_PO8_Cost.getAttribute('value') +
            this.finances_elements.finances_PO9_Cost.getAttribute('value')
        );
    }

    calculateProfitPercent() {
        this.finances_elements.finances_Profit_Percent.setAttribute(
            'value',
            
            Math.round( ((this.finances_elements.finances_Profit_Amount.getAttribute('value') / this.finances_elements.finances_Subtotal_Before_Profit.getAttribute('value') * 100) + Number.EPSILON) * 10 ) / 10
        );
    }

    calculateGrossesAfterComission() {
        this.finances_elements.finances_Gross_Amount.setAttribute(
            'value',
          
            this.finances_elements.finances_Profit_Amount.getAttribute('value') - this.finances_elements.finances_Dealer_Pack.getAttribute('value')
        );


        this.finances_elements.finances_Gross_Percent.setAttribute(
            'value',
          
            Math.round( ((this.finances_elements.finances_Gross_Amount.getAttribute('value') / this.finances_elements.finances_Subtotal_Before_Profit.getAttribute('value') * 100) + Number.EPSILON) * 10 ) / 10
        );
    } 

    calculateTotalAfterProfit() {
        this.finances_elements.finances_Subtotal_After_Profit.setAttribute(
            'value',

            this.finances_elements.finances_Subtotal_Before_Profit.getAttribute('value') +
            this.finances_elements.finances_Profit_Amount.getAttribute('value')
        );
    }


    calculateFETTotals() {
        this.fetCredit_elements.fetCredit_FET_Front_Subtotal.setAttribute(
            'value',
        
            this.fetCredit_elements.fetCredit_FET_Front_Cost.getAttribute('value') *
            this.fetCredit_elements.fetCredit_FET_Front_Quantity.getAttribute('value')
        );

        this.fetCredit_elements.fetCredit_FET_Rear_Subtotal.setAttribute(
            'value',

            this.fetCredit_elements.fetCredit_FET_Rear_Cost.getAttribute('value') *
            this.fetCredit_elements.fetCredit_FET_Rear_Quantity.getAttribute('value')
        );

        this.fetCredit_elements.fetCredit_FET_Total.setAttribute(
            'value',

            this.fetCredit_elements.fetCredit_FET_Front_Subtotal.getAttribute('value') +
            this.fetCredit_elements.fetCredit_FET_Rear_Subtotal.getAttribute('value')
        );
    }


    calculateFETFinances() {
        this.finances_elements.finances_12_FET.setAttribute(
            'value',

            Math.round( (this.finances_elements.finances_Subtotal_After_Profit.getAttribute('value') * 0.12) * 100) / 100
        );


        this.finances_elements.finances_Total_FET.setAttribute(
            'value',

            this.finances_elements.finances_12_FET.getAttribute('value') -
            this.finances_elements.finances_Minus_Tire_FET.getAttribute('value')
        );
    }

    

    calculateGrandTotalDue() {
        let withoutFET = 
            this.finances_elements.finances_Subtotal_After_Profit.getAttribute('value') +
            this.finances_elements.finances_Extended_Warranty.getAttribute('value') +
            this.finances_elements.finances_Other_Fees.getAttribute('value') +
            this.finances_elements.finances_Documentation_Fee.getAttribute('value') -
            this.finances_elements.finances_Deposit.getAttribute('value');

        let withFET = withoutFET + this.finances_elements.finances_Total_FET.getAttribute('value');

        if(this.finances_elements.finances_FET_Checkbox.getAttribute('checked')) {
            this.finances_elements.finances_Total.setAttribute('value', withFET);
        }else {
            this.finances_elements.finances_Total.setAttribute('value', withoutFET);
        }
    }


    makeFinancesCalculations() {
        this.calculateTotalBeforeProfit();

        this.calculateProfitPercent();

        this.calculateGrossesAfterComission();

        this.calculateTotalAfterProfit();

        this.calculateFETTotals();

        this.calculateFETFinances();

        this.calculateGrandTotalDue();
    }


    handleDOMInput(event) {
        switch(event.target.getAttribute("data-id")) {
            case 'finances_PO1_Cost':
                this.makeFinancesCalculations();

                break;

            case 'finances_PO2_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_PO3_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_PO4_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_PO5_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_PO6_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_PO7_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_PO8_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_PO9_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Profit_Amount':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Dealer_Pack':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_FET_Checkbox':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Minus_Tire_FET':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Extended_Warranty':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Other_Fees':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Documentation_Fee':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Deposit':
                this.makeFinancesCalculations();
                
                break;


            case 'fetCredit_FET_Front_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'fetCredit_FET_Front_Quantity':
                this.makeFinancesCalculations();
                
                break;
            
            case 'fetCredit_FET_Rear_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'fetCredit_FET_Rear_Quantity':
                this.makeFinancesCalculations();
                
                break;
            

            default:
                break;
        }
    }


    handleAdminChosen() {
        let adminString = 
            'SELECT OpportunityAdmin__c, Salesman__c, Customer_Name__c, Chassis_Year__c, Chassis_Make__c, Chassis_VIN__c, Chassis_Model__c, Body_Series_Name__c, PO1_Cost__c, PO1_Description__c, PO2_Cost__c, PO2_Description__c, PO3_Cost__c, PO3_Description__c, PO4_Cost__c, PO4_Description__c, PO5_Cost__c, PO5_Description__c, PO6_Cost__c, PO6_Description__c, PO7_Cost__c, PO7_Description__c, PO8_Cost__c, PO8_Description__c, PO9_Cost__c, PO9_Description__c, Profit_Amount__c, Dealer_Pack__c, Minus_Tire_FET__c, Extended_Warranty__c, Other_Fees__c, Documentation_Fee__c, Deposit__c, TradeIn_Make__c, TradeIn_Year__c, TradeIn_Model__c, TradeIn_Unit_Number__c, TradeIn_Actual_Cash_Value__c, TradeIn_Billing_Amount__c, FET_Front_Description__c, FET_Front_Size__c, FET_Front_Cost__c, FET_Front_Quantity__c, FET_Rear_Description__c, FET_Rear_Size__c, FET_Rear_Cost__c, FET_Rear_Quantity__c' +
            ' FROM AdminChecklist__c ' +
            ' WHERE Id = \'' + this.adminChosen + '\'';

        queryFromString({ queryString: adminString }).then(record => {
            if(record.length > 0) {
                this.initializeFromQuery(record[0]);

                this.toastHandler.displayChoice('Admin Checklist Loaded!', '', 'info', 'sticky');
            }else {
                this.toastHandler.displayChoice('No Records Found!', 'Length of records return by queryFromString for AdminChecklist__c in handleAdminChosen is 0', 'error', 'sticky');

                console.log('Length of records return by queryFromString for AdminChecklist__c in handleAdminChosen is 0');
        
                this.thisReference.dispatchEvent(errorToast);
            }
        }).catch(err => {
            this.toastHandler.displayError('Error in call to queryFromString for handleAdminChosen!', 'See console log for more details', err);
        });
    }

    handleAdminGroupChosen() {

    }


    handleClick_SearchQuote() {
        //console.log('Clicked Search Quote');

        let lookUpString =
            'SELECT Name, Salesman__r.Name, OpportunityAdmin__r.Name, Customer_Name__c, LastModifiedDate, CreatedDate' +
            ' FROM AdminChecklist__c';

        let whereString = '';
        let hasWhere = false;

        if(this.lookUpQuote_elements.lookUpQuote_Salesman.getAttribute('value')) {
            whereString += 'Salesman__c = \'' + this.lookUpQuote_elements.lookUpQuote_Salesman.getAttribute('value') + '\'';

            hasWhere = true;
        }

        if(this.lookUpQuote_elements.lookUpQuote_Customer.getAttribute('value')) {
            if(hasWhere) {
                whereString += 'AND ';
            }

            whereString += 'Customer_Name__c LIKE \'%' + this.lookUpQuote_elements.lookUpQuote_Customer.getAttribute('value') + '%\'';

            hasWhere = true;
        }

        if(this.lookUpQuote_elements.lookUpQuote_OpportunityAdmin.getAttribute('value')) {
            if(hasWhere) {
                whereString += 'AND ';
            }

            whereString += 'OpportunityAdmin__c = \'' + this.lookUpQuote_elements.lookUpQuote_OpportunityAdmin.getAttribute('value') + '\'';

            hasWhere = true;
        }


        if(hasWhere) {
            whereString = ' WHERE ' + whereString;

            lookUpString += whereString;
        }


        queryFromString({ queryString: lookUpString }).then(records => {
            if(records.length > 0) {
                this.hasSearchResults = true;

                this.searchResults = [];

                for(const recordIndex in records) {
                    //console.log(records[recordIndex]);

                    //this.searchResults.push(records[recordIndex]);
                    this.searchResults.push({
                        index: recordIndex,

                        id: records[recordIndex].Id,

                        name: records[recordIndex].Name,

                        created: records[recordIndex].CreatedDate.split('Z')[0].replace('T', ' ').split('.')[0],

                        lastModified: records[recordIndex].LastModifiedDate.split('Z')[0].replace('T', ' ').split('.')[0],

                        salesman: records[recordIndex].Salesman__r.Name,

                        customer: records[recordIndex].Customer_Name__c,

                        opportunityAdmin: records[recordIndex].OpportunityAdmin__r.Name
                    });
                }
            }else {
                this.hasSearchResults = false;
            }
        }).catch(err => {
            this.toastHandler.displayError('Error in call to queryFromString for SearchQuote!', 'See console log for more details', err);
        });
    }

    handleSearchSelection(event) {
        try {
            this.adminChosen = event.currentTarget.getAttribute('data-id');
            this.handleAdminChosen();
        }catch(err) {
            this.toastHandler.displayError('Error in handleSearchSelection!', 'See console log for more details', err);
        }
    }


    handleClick_NewAdminGroup() {
        //console.log('Clicked New Admin Group');

        createAdminGroup().then(resultId => {
            this.whoWhat_elements.whoWhat_OpportunityAdmin.setAttribute('value', resultId);
        }).catch(err => {
            this.toastHandler.displayError('Error in call to createAdminGroup!', 'Problem occured while getting creating a new OpportunityAdmin', err);
        });
    }


    handleClick_SaveQuote() {
        //console.log('Clicked Save Quote');

        let fieldValues = {};

        this.appendFieldValuePairs(this.whoWhat_elements, fieldValues);
        this.appendFieldValuePairs(this.finances_elements, fieldValues);
        this.appendFieldValuePairs(this.tradeIn_elements, fieldValues);
        this.appendFieldValuePairs(this.fetCredit_elements, fieldValues);

        // If we have the Id of which Admin we want to update then call update, otherwise call insert
        if(this.adminChosen) {
            updateRecordFromId({ objectName: 'AdminChecklist__c', recordId: this.adminChosen, fieldValuePairs: fieldValues }).then(isSuccess => {
                if(isSuccess) {
                    this.toastHandler.displaySuccess('AdminChecklist Updated!', '');
                }else {
                    this.toastHandler.displayChoice('Failed to update Admin Checklist', 'Something went wrong', 'error', 'sticky');
                }
            }).catch(err => {
                this.toastHandler.displayError('Error in call to updateRecordFromId for AdminChecklist__c!', 'An error occured, see console log for more details', err);
            });
        }else {
            insertRecord({ objectName: 'AdminChecklist__c', fieldValuePairs: fieldValues }).then(isSuccess => {
                if(isSuccess) {
                    this.toastHandler.displaySuccess('AdminChecklist Inserted!', '');
                }else {
                    this.toastHandler.displayChoice('Failed to insert Admin Checklist', 'Something went wrong', 'error', 'sticky');
                }
            }).catch(err => {
                this.toastHandler.displayError('Error in call to insertRecord for AdminCheclist__c!', 'An error occured, see console log for more details', err);
            });
        }
    }


    handleClick_PrintQuote() {
        //console.log('Clicked Print Quote');

        let fieldValues = {};

        this.appendFieldValuePairs(this.whoWhat_elements, fieldValues);
        this.appendFieldValuePairs(this.finances_elements, fieldValues);
        this.appendFieldValuePairs(this.tradeIn_elements, fieldValues);
        this.appendFieldValuePairs(this.fetCredit_elements, fieldValues);

        fieldValues['Id'] = this.adminChosen;

        fieldValues['subtotal_before_profit'] = this.finances_elements.finances_Subtotal_Before_Profit.getAttribute('value');

        fieldValues['profit_percent'] = this.finances_elements.finances_Profit_Percent.getAttribute('value');

        fieldValues['gross_amount'] = this.finances_elements.finances_Gross_Amount.getAttribute('value');
        fieldValues['gross_percent'] = this.finances_elements.finances_Gross_Percent.getAttribute('value');
        
        fieldValues['subtotal_after_profit'] = this.finances_elements.finances_Subtotal_After_Profit.getAttribute('value');

        fieldValues['apply_fet'] = this.finances_elements.finances_FET_Checkbox.getAttribute('checked');
        fieldValues['12_fet'] = this.finances_elements.finances_12_FET.getAttribute('value');
        fieldValues['total_fet'] = this.finances_elements.finances_Total_FET.getAttribute('value');

        fieldValues['total'] = this.finances_elements.finances_Total.getAttribute('value');


        downloadAdmin({ fieldValuePairs: fieldValues }).then(content => {
            let byteContent = atob(content);
            let buf = new Array(byteContent.length);

            for(var i = 0; i != byteContent.length; i++) {
                buf[i] = byteContent.charCodeAt(i);
            }

            const view = new Uint8Array(buf);

            let b = new Blob([view], {type: 'application/pdf'});

            console.log(b);

            saveBlob(b, 'Admin_' + this.whoWhat_elements.whoWhat_Body_Series_Name.getAttribute('value') + '.pdf');
        }).catch(err => {
            this.toastHandler.displayError('Error in call to downloadAdmin for PrintQuote!', 'See console log for more details', err);
        });

    }


    handleClick_CloneQuote() {
        //console.log('Clicked Clone Quote');
    }



    appendFieldValuePairs(fieldObject, fieldValueMap) {
        for(const key in fieldObject) {
            if(fieldObject[key].apiFieldName) {
                if(fieldObject[key].getAttribute('value')) {
                    fieldValueMap[fieldObject[key].apiFieldName] = fieldObject[key].getAttribute('value');
                }
            }
        }
    }


    updateValuesFromQuery(fieldObject, result) {
        for(const key in fieldObject) {
            if(fieldObject[key].apiFieldName) {
                if(result[fieldObject[key].apiFieldName] !== null && result[fieldObject[key].apiFieldName] !== undefined) {
                    fieldObject[key].setAttribute('value', result[fieldObject[key].apiFieldName]);
                }
            }
        }
    }


    queryAdminChecklist_Defaults() {
        return getObjectDefaults({ objectName: 'AdminChecklist__c' }).then( admin => {

            this.defaultAdminChecklist = admin;
        } ).catch(err => {
            this.toastHandler.displayError('Error in call to queryFromString for AdminChecklist_Defaults!', 'Problem occured while getting default values of AdminChecklist__c', err);
        });
    }


    createLWC_Elements() {
        if(!this.lookUpQuote_elements) {
            this.lookUpQuote_elements = {};

            this.lookUpQuote_elements.lookUpQuote_Salesman = new LWC_Input_Element('lookUpQuote_Salesman', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));

            this.lookUpQuote_elements.lookUpQuote_Customer = new LWC_Input_Element('lookUpQuote_Customer', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));

            this.lookUpQuote_elements.lookUpQuote_OpportunityAdmin = new LWC_Input_Element('lookUpQuote_OpportunityAdmin', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
        }


        if(!this.whoWhat_elements) {
            this.whoWhat_elements = {};

            this.whoWhat_elements.whoWhat_OpportunityAdmin = new LWC_Input_Element('whoWhat_OpportunityAdmin', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_OpportunityAdmin.setApiFieldName('OpportunityAdmin__c');

            this.whoWhat_elements.whoWhat_Salesman = new LWC_Input_Element('whoWhat_Salesman', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Salesman.setApiFieldName('Salesman__c');

            this.whoWhat_elements.whoWhat_Customer = new LWC_Input_Element('whoWhat_Customer', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Customer.setApiFieldName('Customer_Name__c');

            this.whoWhat_elements.whoWhat_Chassis_Make = new LWC_Input_Element('whoWhat_Chassis_Make', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Chassis_Make.setApiFieldName('Chassis_Make__c');

            this.whoWhat_elements.whoWhat_Chassis_Model = new LWC_Input_Element('whoWhat_Chassis_Model', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Chassis_Model.setApiFieldName('Chassis_Model__c');

            this.whoWhat_elements.whoWhat_Chassis_Year = new LWC_Input_Element('whoWhat_Chassis_Year', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Chassis_Year.setApiFieldName('Chassis_Year__c');

            this.whoWhat_elements.whoWhat_Chassis_VIN = new LWC_Input_Element('whoWhat_Chassis_VIN', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Chassis_VIN.setApiFieldName('Chassis_VIN__c');

            this.whoWhat_elements.whoWhat_Body_Series_Name = new LWC_Input_Element('whoWhat_Body_Series_Name', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Body_Series_Name.setApiFieldName('Body_Series_Name__c');
        }

        if(!this.finances_elements) {
            this.finances_elements = {};

            this.finances_elements.finances_PO1_Cost = new LWC_Input_Element('finances_PO1_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO1_Cost.setApiFieldName('PO1_Cost__c');

            this.finances_elements.finances_PO1_Description = new LWC_Input_Element('finances_PO1_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO1_Description.setApiFieldName('PO1_Description__c');


            this.finances_elements.finances_PO2_Cost = new LWC_Input_Element('finances_PO2_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO2_Cost.setApiFieldName('PO2_Cost__c');

            this.finances_elements.finances_PO2_Description = new LWC_Input_Element('finances_PO2_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO2_Description.setApiFieldName('PO2_Description__c');


            this.finances_elements.finances_PO3_Cost = new LWC_Input_Element('finances_PO3_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO3_Cost.setApiFieldName('PO3_Cost__c');

            this.finances_elements.finances_PO3_Description = new LWC_Input_Element('finances_PO3_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO3_Description.setApiFieldName('PO3_Description__c');


            this.finances_elements.finances_PO4_Cost = new LWC_Input_Element('finances_PO4_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO4_Cost.setApiFieldName('PO4_Cost__c');

            this.finances_elements.finances_PO4_Description = new LWC_Input_Element('finances_PO4_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO4_Description.setApiFieldName('PO4_Description__c');


            this.finances_elements.finances_PO5_Cost = new LWC_Input_Element('finances_PO5_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO5_Cost.setApiFieldName('PO5_Cost__c');

            this.finances_elements.finances_PO5_Description = new LWC_Input_Element('finances_PO5_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO5_Description.setApiFieldName('PO5_Description__c');


            this.finances_elements.finances_PO6_Cost = new LWC_Input_Element('finances_PO6_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO6_Cost.setApiFieldName('PO6_Cost__c');

            this.finances_elements.finances_PO6_Description = new LWC_Input_Element('finances_PO6_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO6_Description.setApiFieldName('PO6_Description__c');


            this.finances_elements.finances_PO7_Cost = new LWC_Input_Element('finances_PO7_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO7_Cost.setApiFieldName('PO7_Cost__c');

            this.finances_elements.finances_PO7_Description = new LWC_Input_Element('finances_PO7_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO7_Description.setApiFieldName('PO7_Description__c');


            this.finances_elements.finances_PO8_Cost = new LWC_Input_Element('finances_PO8_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO8_Cost.setApiFieldName('PO8_Cost__c');

            this.finances_elements.finances_PO8_Description = new LWC_Input_Element('finances_PO8_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO8_Description.setApiFieldName('PO8_Description__c');


            this.finances_elements.finances_PO9_Cost = new LWC_Input_Element('finances_PO9_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO9_Cost.setApiFieldName('PO9_Cost__c');

            this.finances_elements.finances_PO9_Description = new LWC_Input_Element('finances_PO9_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO9_Description.setApiFieldName('PO9_Description__c');


            this.finances_elements.finances_Subtotal_Before_Profit = new LWC_Element('finances_Subtotal_Before_Profit', this.template, this.currencyAttributeHandler);



            this.finances_elements.finances_Profit_Amount = new LWC_Input_Element('finances_Profit_Amount', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Profit_Amount.setApiFieldName('Profit_Amount__c');
            
            this.finances_elements.finances_Profit_Percent = new LWC_Element('finances_Profit_Percent', this.template,  this.numberAttributeHandler);

            this.finances_elements.finances_Dealer_Pack = new LWC_Input_Element('finances_Dealer_Pack', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Dealer_Pack.setApiFieldName('Dealer_Pack__c');

            this.finances_elements.finances_Gross_Amount = new LWC_Element('finances_Gross_Amount', this.template,  this.currencyAttributeHandler);

            this.finances_elements.finances_Gross_Percent = new LWC_Element('finances_Gross_Percent', this.template,  this.numberAttributeHandler);



            this.finances_elements.finances_Subtotal_After_Profit = new LWC_Element('finances_Subtotal_After_Profit', this.template, this.currencyAttributeHandler);


            this.finances_elements.finances_FET_Checkbox = new LWC_Input_Element('finances_FET_Checkbox', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));

            this.finances_elements.finances_12_FET = new LWC_Element('finances_12_FET', this.template, this.currencyAttributeHandler);

            this.finances_elements.finances_Minus_Tire_FET = new LWC_Input_Element('finances_Minus_Tire_FET', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Minus_Tire_FET.setApiFieldName('Minus_Tire_FET__c');

            this.finances_elements.finances_Total_FET = new LWC_Element('finances_Total_FET', this.template, this.currencyAttributeHandler);



            this.finances_elements.finances_Extended_Warranty = new LWC_Input_Element('finances_Extended_Warranty', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Extended_Warranty.setApiFieldName('Extended_Warranty__c');

            this.finances_elements.finances_Other_Fees = new LWC_Input_Element('finances_Other_Fees', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Other_Fees.setApiFieldName('Other_Fees__c');

            this.finances_elements.finances_Documentation_Fee = new LWC_Input_Element('finances_Documentation_Fee', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Documentation_Fee.setApiFieldName('Documentation_Fee__c');

            this.finances_elements.finances_Deposit = new LWC_Input_Element('finances_Deposit', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Deposit.setApiFieldName('Deposit__c');

            this.finances_elements.finances_Total = new LWC_Element('finances_Total', this.template, this.currencyAttributeHandler);
        }


        if(!this.tradeIn_elements) {
            this.tradeIn_elements = {};

            this.tradeIn_elements.tradeIn_Make = new LWC_Input_Element('tradeIn_Make', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Make.setApiFieldName('TradeIn_Make__c');

            this.tradeIn_elements.tradeIn_Model = new LWC_Input_Element('tradeIn_Model', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Model.setApiFieldName('TradeIn_Model__c');

            this.tradeIn_elements.tradeIn_Year = new LWC_Input_Element('tradeIn_Year', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Year.setApiFieldName('TradeIn_Year__c');

            this.tradeIn_elements.tradeIn_Unit_Number = new LWC_Input_Element('tradeIn_Unit_Number', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Unit_Number.setApiFieldName('TradeIn_Unit_Number__c');

            this.tradeIn_elements.tradeIn_Actual_Cash_Value = new LWC_Input_Element('tradeIn_Actual_Cash_Value', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Actual_Cash_Value.setApiFieldName('TradeIn_Actual_Cash_Value__c');

            this.tradeIn_elements.tradeIn_Billing_Amount = new LWC_Input_Element('tradeIn_Billing_Amount', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Billing_Amount.setApiFieldName('TradeIn_Billing_Amount__c');
        }


        if(!this.fetCredit_elements) {
            this.fetCredit_elements = {};

            this.fetCredit_elements.fetCredit_FET_Front_Description = new LWC_Input_Element('fetCredit_FET_Front_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Front_Description.setApiFieldName('FET_Front_Description__c');

            this.fetCredit_elements.fetCredit_FET_Front_Size = new LWC_Input_Element('fetCredit_FET_Front_Size', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Front_Size.setApiFieldName('FET_Front_Size__c');

            this.fetCredit_elements.fetCredit_FET_Front_Cost = new LWC_Input_Element('fetCredit_FET_Front_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Front_Cost.setApiFieldName('FET_Front_Cost__c');

            this.fetCredit_elements.fetCredit_FET_Front_Quantity = new LWC_Input_Element('fetCredit_FET_Front_Quantity', this.template, this.numberAttributeHandler, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Front_Quantity.setApiFieldName('FET_Front_Quantity__c');

            this.fetCredit_elements.fetCredit_FET_Front_Subtotal = new LWC_Element('fetCredit_FET_Front_Subtotal', this.template, this.currencyAttributeHandler);


            this.fetCredit_elements.fetCredit_FET_Rear_Description = new LWC_Input_Element('fetCredit_FET_Rear_Description', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Rear_Description.setApiFieldName('FET_Rear_Description__c');

            this.fetCredit_elements.fetCredit_FET_Rear_Size = new LWC_Input_Element('fetCredit_FET_Rear_Size', this.template, this.arbitraryAttributeHandler, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Rear_Size.setApiFieldName('FET_Rear_Size__c');

            this.fetCredit_elements.fetCredit_FET_Rear_Cost = new LWC_Input_Element('fetCredit_FET_Rear_Cost', this.template, this.currencyAttributeHandler, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Rear_Cost.setApiFieldName('FET_Rear_Cost__c');

            this.fetCredit_elements.fetCredit_FET_Rear_Quantity = new LWC_Input_Element('fetCredit_FET_Rear_Quantity', this.template, this.numberAttributeHandler, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Rear_Quantity.setApiFieldName('FET_Rear_Quantity__c');

            this.fetCredit_elements.fetCredit_FET_Rear_Subtotal = new LWC_Element('fetCredit_FET_Rear_Subtotal', this.template, this.currencyAttributeHandler);


            this.fetCredit_elements.fetCredit_FET_Total = new LWC_Element('fetCredit_FET_Total', this.template, this.currencyAttributeHandler);
        }
    }


    constructor() {
        super();

        this.arbitraryAttributeHandler = new Attribute_Handler('arbitrary');
        this.numberAttributeHandler = new Attribute_Handler('number');
        this.currencyAttributeHandler = new Attribute_Handler('currency');

        this.toastHandler = new LWC_Toast(this);

        this.createLWC_Elements();
    }



    initializeLWC_Elements() {
        if(!this.lookUpQuote_elements.lookUpQuote_Salesman.isInitialized) {
            for(const key in this.lookUpQuote_elements) {
                this.lookUpQuote_elements[key].initialize();
            }


            // Default Salesman Lookup to Current User
            this.lookUpQuote_elements.lookUpQuote_Salesman.setAttribute('value', this.currentUser);
        }


        if(!this.whoWhat_elements.whoWhat_Salesman.isInitialized) {
            for(const key in this.whoWhat_elements) {
                this.whoWhat_elements[key].initialize();
            }

            // Default Salesman Lookup to Current User
            this.whoWhat_elements.whoWhat_Salesman.setAttribute('value', this.currentUser);
        }

        if(!this.finances_elements.finances_PO1_Cost.isInitialized) {
            for(const key in this.finances_elements) {
                this.finances_elements[key].initialize();
            }
        }


        if(!this.fetCredit_elements.fetCredit_FET_Front_Description.isInitialized) {
            for(const key in this.fetCredit_elements) {
                this.fetCredit_elements[key].initialize();
            }
        }


        if(!this.tradeIn_elements.tradeIn_Make.isInitialized) {
            for(const key in this.tradeIn_elements) {
                this.tradeIn_elements[key].initialize();
            }
        }
    }


    initializeFromQuery(queryValues) {
        this.updateValuesFromQuery(this.whoWhat_elements, queryValues);

        this.updateValuesFromQuery(this.fetCredit_elements, queryValues);

        this.updateValuesFromQuery(this.tradeIn_elements, queryValues);

        this.updateValuesFromQuery(this.finances_elements, queryValues);


        this.makeFinancesCalculations();
    }


    renderedCallback() {
        if(!this.defaultAdminChecklist) {
            this.queryAdminChecklist_Defaults().then(() => {
                this.initializeLWC_Elements();


                this.initializeFromQuery(this.defaultAdminChecklist);
            }).catch(err => {
                this.toastHandler.displayError('Error in call to then after queryAdminChecklist_Defaults!', 'Something went wrong, see console log for more info', err);
            });
        }
    }
}