import { LightningElement } from 'lwc';

import {LWC_Toast, LWC_Element, LWC_Input_Element, Attribute_Handler} from 'c/lwc_js_common';
import {blobToPDF} from 'c/lwc_blob_handlers'

import Id from '@salesforce/user/Id';

import queryFromString from '@salesforce/apex/ApexDataInterface.queryFromString';
import updateRecordFromId from '@salesforce/apex/ApexDataInterface.updateRecordFromId';
import getObjectDefaults from '@salesforce/apex/ApexDataInterface.getObjectDefaults';

import insertRecord from '@salesforce/apex/AdminChecklist_Controller.insertRecord';
import downloadAdmin from '@salesforce/apex/AdminChecklist_Controller.downloadAdmin';
import getProducts from '@salesforce/apex/AdminChecklist_Controller.getProducts';
import getPOs from '@salesforce/apex/AdminChecklist_Controller.getPOs';



export default class Admin_checklist extends LightningElement {
    currentUser = Id;

    adminChosen;
    adminData;

    groupChosen;

    hasSearchResults;
    searchResults;

    toastHandler;

    whoWhat_elements;
    fetCredit_elements;
    tradeIn_elements;
    finances_elements;

    defaultAdminChecklist;

    arbitraryAttributeHandler;
    numberAttributeHandler;
    currencyAttributeHandler;
    percentAttributeHandler;

    opportunity;
    opportunityData;

    oppProducts;


    calculateTotalBeforeProfit() {
        this.finances_elements.finances_Subtotal_Before_Profit.setAttribute(
            'value', 

            this.finances_elements.finances_Chassis_Cost.getAttribute('value') +
            this.finances_elements.finances_Body_Cost.getAttribute('value') +
            this.finances_elements.finances_Freight_Cost.getAttribute('value') +
            this.finances_elements.finances_AOrder_Cost.getAttribute('value') +
            this.finances_elements.finances_Other_1_Cost.getAttribute('value') +
            this.finances_elements.finances_Other_2_Cost.getAttribute('value') +
            this.finances_elements.finances_Other_3_Cost.getAttribute('value') +
            this.finances_elements.finances_Other_4_Cost.getAttribute('value') +
            this.finances_elements.finances_Other_5_Cost.getAttribute('value')
        );
    }

    calculateProfitAmount() {
        this.finances_elements.finances_Profit_Amount.setAttribute(
            'value',

           this.finances_elements.finances_Profit_Percent.getAttribute('value') * this.finances_elements.finances_Subtotal_Before_Profit.getAttribute('value')
        );
    }

    calculateProfitPercent() {
        this.finances_elements.finances_Profit_Percent.setAttribute(
            'value',
            
            this.finances_elements.finances_Profit_Amount.getAttribute('value') / (this.finances_elements.finances_Subtotal_Before_Profit.getAttribute('value') + this.finances_elements.finances_Profit_Amount.getAttribute('value'))
        );
    }

    calculateGrossesAfterComission() {
        this.finances_elements.finances_Gross_Amount.setAttribute(
            'value',
          
            this.finances_elements.finances_Profit_Amount.getAttribute('value') - this.finances_elements.finances_Dealer_Pack.getAttribute('value')
        );


        this.finances_elements.finances_Gross_Percent.setAttribute(
            'value',
          
            this.finances_elements.finances_Gross_Amount.getAttribute('value') / (this.finances_elements.finances_Subtotal_Before_Profit.getAttribute('value') + this.finances_elements.finances_Profit_Amount.getAttribute('value'))
        );
    } 

    calculateTotalAfterProfit() {
        this.finances_elements.finances_Subtotal_After_Profit.setAttribute(
            'value',

            this.finances_elements.finances_Subtotal_Before_Profit.getAttribute('value') + this.finances_elements.finances_Profit_Amount.getAttribute('value')
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

    // Don't recalculate profit percent, instead recalculate profit amount.
    // The other one (makeFinancesCalculations) does the reverse
    makeFinancesCalculationsAfterPercent() {
        this.calculateTotalBeforeProfit();

        this.calculateProfitAmount();

        this.calculateGrossesAfterComission();

        this.calculateTotalAfterProfit();

        this.calculateFETTotals();

        this.calculateFETFinances();

        this.calculateGrandTotalDue();
    }


    handleInputFieldChange(event) {
        event.preventDefault();
        event.stopPropagation();
    }


    handleDOMInput(event) {
        switch(event.target.getAttribute("data-id")) {
            case 'finances_Chassis_Cost':
                this.makeFinancesCalculations();

                break;

            case 'finances_Body_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Freight_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_AOrder_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Other_1_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Other_2_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Other_3_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Other_4_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Other_5_Cost':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Profit_Amount':
                this.makeFinancesCalculations();
                
                break;

            case 'finances_Profit_Percent':
                // If I am above 1 then divide by 100 so that it is easier for them to type it in
                if((event.target.value - 1.0) > 0.001) {
                    event.target.value /= 100.0;
                }

                this.makeFinancesCalculationsAfterPercent();

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


    handleAdminChosen(event) {
        if(event) {
            this.adminChosen = event.detail.value;
        }

        // Clear everything out to the defaults and then get the Admin and update
        this.queryAdminChecklist_Defaults().then(() => {
            this.initializeFromAdmin(this.defaultAdminChecklist);


            // If you don't yet have an Opportunity tied to you then just pull the Admin, otherwise pull the Opportunity and
            // set the Admin values if an opportunity with this admin id is found
            queryFromString({ 
                queryString: 'SELECT Id, Name, OwnerId, Account.Name, Gross_Amount_s__c, Deposit_Received__c, Doc_Fee__c, Total_PAC_Fees__c' +
                ' FROM Opportunity ' +
                ' WHERE AdminChecklist__c=\'' + this.adminChosen + '\''
            }).then(haveAdmins => {
                if(haveAdmins.length > 0) {
                    this.opportunity = haveAdmins[0].Id;

                    this.opportunityData = haveAdmins[0];

                    this.initializeFromOpportunity(haveAdmins[0]);

                    getProducts({ oppId: haveAdmins[0].Id }).then(lineItems => {
                        if(lineItems) {
                            if(lineItems.length > 0) {
                                console.log('(admin_in_opportunity)');
                                console.log(lineItems);

                                this.oppProducts = lineItems;

                                this.initializeFromLineItems(lineItems);

                                getPOs({ lineItems: lineItems }).then(poLines => {
                                    if(poLines) {
                                        if(poLines.length > 0) {
                                            console.log('(admin_in_opportunity)');
                                            console.log(poLines);

                                            this.initializeFromPOs(poLines);

                                            this.toastHandler.displayChoice('Admin Checklist Loaded!', '', 'info', 'sticky');
                                        }else {
                                            this.toastHandler.displayChoice('No Purchase Orders found for the Products in this Opportunity', '', 'info', 'sticky');
                                        }
                                    }
                                }).catch(err => {
                                    this.toastHandler.displayError('Error in call to getPOs!', '(admin_in_opportunity) See console log for more details', err);
                                });
                            }else {
                                this.toastHandler.displayChoice('No Products found for this Opportunity.', '', 'info', 'sticky');
                            }
                        }
                    }).catch(err => {
                        this.toastHandler.displayError('Error in call to getProducts!', '(admin_in_opportunity) See console log for more details', err);
                    });
                }else {
                    let adminString = 
                        'SELECT Name__c, Salesman__c, Customer_Name__c, Chassis_Year__c, Chassis_Make__c, Chassis_VIN__c, Chassis_Model__c, Date__c, Body_Series_Name__c, Chassis_Cost__c, Chassis_Description__c, Body_Cost__c, Body_Description__c, Freight_Cost__c, Freight_Description__c, AOrder_Cost__c, AOrder_Description__c, Other_1_Cost__c, Other_1_Description__c, Other_2_Cost__c, Other_2_Description__c, Other_3_Cost__c, Other_3_Description__c, Other_4_Cost__c, Other_4_Description__c, Other_5_Cost__c, Other_5_Description__c, Profit_Amount__c, Dealer_Pack__c, Minus_Tire_FET__c, Extended_Warranty__c, Other_Fees__c, Documentation_Fee__c, Deposit__c, TradeIn_Make__c, TradeIn_Year__c, TradeIn_Model__c, TradeIn_Unit_Number__c, TradeIn_Actual_Cash_Value__c, TradeIn_Billing_Amount__c, FET_Front_Description__c, FET_Front_Size__c, FET_Front_Cost__c, FET_Front_Quantity__c, FET_Rear_Description__c, FET_Rear_Size__c, FET_Rear_Cost__c, FET_Rear_Quantity__c' +
                        ' FROM AdminChecklist__c ' +
                        ' WHERE Id = \'' + this.adminChosen + '\'';

                    queryFromString({ queryString: adminString }).then(record => {
                        if(record.length > 0) {
                            this.initializeFromAdmin(record[0]);

                            this.toastHandler.displayChoice('Admin Checklist Loaded!', '', 'info', 'sticky');
                        }else {
                            this.toastHandler.displayChoice('No Records Found!', '(admin_in_opportunity) Length of records return by queryFromString for AdminChecklist__c in handleAdminChosen is 0', 'error', 'sticky');

                            console.log('Length of records return by queryFromString for AdminChecklist__c in handleAdminChosen is 0');
                    
                            this.thisReference.dispatchEvent(errorToast);
                        }
                    }).catch(err => {
                        this.toastHandler.displayError('Error in call to queryFromString for handleAdminChosen!', '(admin_in_opportunity) See console log for more details', err);
                    });
                }
            }).catch(err => {
                this.toastHandler.displayError('Something Went Wrong!', 'Error in call to queryFromString for Opportunity in handleAdminChosen', err);
            });
        }).catch(err => {
            this.toastHandler.displayError('Error in call to then after queryAdminChecklist_Defaults!', '(admin_in_opportunity) Something went wrong, see console log for more info', err);
        });
    }


    // Needed by Save Button and Clone Button so sticking Insert itself into 1 place
    makeInsert(fieldValues) {
        insertRecord({ objectName: 'AdminChecklist__c', fieldValuePairs: fieldValues }).then(newId => {
            if(newId) {
                this.adminChosen = newId;

                this.toastHandler.displaySuccess('AdminChecklist Inserted!', '');
            }else {
                this.toastHandler.displayChoice('Failed to insert Admin Checklist', '(admin_in_opportunity) Something went wrong', 'error', 'sticky');
            }
        }).catch(err => {
            this.toastHandler.displayError('Error in call to insertRecord for AdminCheclist__c!', '(admin_in_opportunity) An error occured, see console log for more details', err);
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
                    this.toastHandler.displayChoice('Failed to update Admin Checklist', '(admin_in_opportunity) Something went wrong', 'error', 'sticky');
                }
            }).catch(err => {
                this.toastHandler.displayError('Error in call to updateRecordFromId for AdminChecklist__c!', '(admin_in_opportunity) An error occured, see console log for more details', err);
            });
        }else {
            this.makeInsert(fieldValues);
        }
    }


    handleClick_PrintQuote() {
        //console.log('Clicked Print Quote');


        // Save Admin and Print to Pdf and save that file
        this.handleClick_SaveQuote();


        let fieldValues = {};

        this.appendFieldValuePairs(this.whoWhat_elements, fieldValues);
        this.appendFieldValuePairs(this.finances_elements, fieldValues);
        this.appendFieldValuePairs(this.tradeIn_elements, fieldValues);
        this.appendFieldValuePairs(this.fetCredit_elements, fieldValues);

        fieldValues['Id'] = this.adminChosen;
        
        fieldValues['salesman'] = this.whoWhat_elements.whoWhat_Salesman.getAttribute('value');

        fieldValues['date'] = this.whoWhat_elements.whoWhat_Date.getAttribute('value');

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

            let fileName = '';
            if(this.whoWhat_elements.whoWhat_AdminName.getAttribute('value') && this.whoWhat_elements.whoWhat_AdminName.getAttribute('value') != '') {
                fileName += 'Admin_' + this.whoWhat_elements.whoWhat_AdminName.getAttribute('value');
            }else {
                fileName += 'Admin_' + this.whoWhat_elements.whoWhat_Body_Series_Name.getAttribute('value')
            }

            blobToPDF(b, fileName + '.pdf');
        }).catch(err => {
            this.toastHandler.displayError('Error in call to downloadAdmin for PrintQuote!', '(admin_in_opportunity) See console log for more details', err);
        });

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
        let needsEmptied;

        for(const key in fieldObject) {
            needsEmptied = false;

            if(fieldObject[key].apiFieldName) {
                if(result[fieldObject[key].apiFieldName] !== null && result[fieldObject[key].apiFieldName] !== undefined) {
                    fieldObject[key].setAttribute('value', result[fieldObject[key].apiFieldName]);
                }else {
                    needsEmptied = true;
                }
            }else {
                needsEmptied = true;
            }

            if(needsEmptied) {
                fieldObject[key].setAttribute('value', '');
            }
        }
    }

    /*
    updateValuesFromOpportunity(fieldObject, result) {
        let needsEmptied;

        for(const key in fieldObject) {
            needsEmptied = false;

            if(fieldObject[key].apiFieldName) {
                if(result[fieldObject[key].apiFieldName] !== null && result[fieldObject[key].apiFieldName] !== undefined) {
                    fieldObject[key].setAttribute('value', result[fieldObject[key].apiFieldName]);
                }else {
                    needsEmptied = true;
                }
            }else {
                needsEmptied = true;
            }

            if(needsEmptied) {
                fieldObject[key].setAttribute('value', '');
            }
        }
    }
    */


    queryAdminChecklist_Defaults() {
        return getObjectDefaults({ objectName: 'AdminChecklist__c' }).then( admin => {

            this.defaultAdminChecklist = admin;
        } ).catch(err => {
            this.toastHandler.displayError('Error in call to queryFromString for AdminChecklist_Defaults!', 'Problem occured while getting default values of AdminChecklist__c', err);
        });
    }


    createLWC_Elements() {
        if(!this.whoWhat_elements) {
            this.whoWhat_elements = {};

            this.whoWhat_elements.whoWhat_AdminName = new LWC_Input_Element('whoWhat_AdminName', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_AdminName.setApiFieldName('Name__c');

            this.whoWhat_elements.whoWhat_OpportunityLink = new LWC_Input_Element('whoWhat_OpportunityLink', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });

            this.whoWhat_elements.whoWhat_Salesman = new LWC_Input_Element('whoWhat_Salesman', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_Salesman.setApiFieldName('Salesman__c');

            this.whoWhat_elements.whoWhat_Customer = new LWC_Input_Element('whoWhat_Customer', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_Customer.setApiFieldName('Customer_Name__c');

            this.whoWhat_elements.whoWhat_Date = new LWC_Input_Element('whoWhat_Date', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_Date.setApiFieldName('Date__c');

            this.whoWhat_elements.whoWhat_Chassis_Make = new LWC_Input_Element('whoWhat_Chassis_Make', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_Chassis_Make.setApiFieldName('Chassis_Make__c');

            this.whoWhat_elements.whoWhat_Chassis_Model = new LWC_Input_Element('whoWhat_Chassis_Model', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_Chassis_Model.setApiFieldName('Chassis_Model__c');

            this.whoWhat_elements.whoWhat_Chassis_Year = new LWC_Input_Element('whoWhat_Chassis_Year', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_Chassis_Year.setApiFieldName('Chassis_Year__c');

            this.whoWhat_elements.whoWhat_Chassis_VIN = new LWC_Input_Element('whoWhat_Chassis_VIN', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_Chassis_VIN.setApiFieldName('Chassis_VIN__c');

            this.whoWhat_elements.whoWhat_Body_Series_Name = new LWC_Input_Element('whoWhat_Body_Series_Name', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.whoWhat_elements.whoWhat_Body_Series_Name.setApiFieldName('Body_Series_Name__c');
        }

        if(!this.finances_elements) {
            this.finances_elements = {};

            this.finances_elements.finances_Chassis_Cost = new LWC_Input_Element('finances_Chassis_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Chassis_Cost.setApiFieldName('Chassis_Cost__c');

            this.finances_elements.finances_Chassis_Description = new LWC_Input_Element('finances_Chassis_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Chassis_Description.setApiFieldName('Chassis_Description__c');

            this.finances_elements.finances_Chassis_POInfo = new LWC_Input_Element('finances_Chassis_POInfo', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });

            this.finances_elements.finances_Body_Cost = new LWC_Input_Element('finances_Body_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Body_Cost.setApiFieldName('Body_Cost__c');

            this.finances_elements.finances_Body_Description = new LWC_Input_Element('finances_Body_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Body_Description.setApiFieldName('Body_Description__c');

            this.finances_elements.finances_Body_POInfo = new LWC_Input_Element('finances_Body_POInfo', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });


            this.finances_elements.finances_Freight_Cost = new LWC_Input_Element('finances_Freight_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Freight_Cost.setApiFieldName('Freight_Cost__c');

            this.finances_elements.finances_Freight_Description = new LWC_Input_Element('finances_Freight_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Freight_Description.setApiFieldName('Freight_Description__c');

            this.finances_elements.finances_Freight_POInfo = new LWC_Input_Element('finances_Freight_POInfo', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });


            this.finances_elements.finances_AOrder_Cost = new LWC_Input_Element('finances_AOrder_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_AOrder_Cost.setApiFieldName('AOrder_Cost__c');

            this.finances_elements.finances_AOrder_Description = new LWC_Input_Element('finances_AOrder_Description', this.template, this.arbitraryAttributeHandler,  (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_AOrder_Description.setApiFieldName('AOrder_Description__c');

            this.finances_elements.finances_AOrder_POInfo = new LWC_Input_Element('finances_AOrder_POInfo', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });


            this.finances_elements.finances_Other_1_Cost = new LWC_Input_Element('finances_Other_1_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_1_Cost.setApiFieldName('Other_1_Cost__c');

            this.finances_elements.finances_Other_1_Description = new LWC_Input_Element('finances_Other_1_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_1_Description.setApiFieldName('Other_1_Description__c');


            this.finances_elements.finances_Other_2_Cost = new LWC_Input_Element('finances_Other_2_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_2_Cost.setApiFieldName('Other_2_Cost__c');

            this.finances_elements.finances_Other_2_Description = new LWC_Input_Element('finances_Other_2_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_2_Description.setApiFieldName('Other_2_Description__c');


            this.finances_elements.finances_Other_3_Cost = new LWC_Input_Element('finances_Other_3_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_3_Cost.setApiFieldName('Other_3_Cost__c');

            this.finances_elements.finances_Other_3_Description = new LWC_Input_Element('finances_Other_3_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_3_Description.setApiFieldName('Other_3_Description__c');


            this.finances_elements.finances_Other_4_Cost = new LWC_Input_Element('finances_Other_4_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_4_Cost.setApiFieldName('Other_4_Cost__c');

            this.finances_elements.finances_Other_4_Description = new LWC_Input_Element('finances_Other_4_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_4_Description.setApiFieldName('Other_4_Description__c');


            this.finances_elements.finances_Other_5_Cost = new LWC_Input_Element('finances_Other_5_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_5_Cost.setApiFieldName('Other_5_Cost__c');

            this.finances_elements.finances_Other_5_Description = new LWC_Input_Element('finances_Other_5_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_5_Description.setApiFieldName('Other_5_Description__c');


            this.finances_elements.finances_Subtotal_Before_Profit = new LWC_Element('finances_Subtotal_Before_Profit', this.template, this.currencyAttributeHandler);



            this.finances_elements.finances_Profit_Amount = new LWC_Input_Element('finances_Profit_Amount', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Profit_Amount.setApiFieldName('Profit_Amount__c');
            
            this.finances_elements.finances_Profit_Percent = new LWC_Input_Element('finances_Profit_Percent', this.template,  this.percentAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });

            this.finances_elements.finances_Dealer_Pack = new LWC_Input_Element('finances_Dealer_Pack', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Dealer_Pack.setApiFieldName('Dealer_Pack__c');

            this.finances_elements.finances_Gross_Amount = new LWC_Element('finances_Gross_Amount', this.template,  this.currencyAttributeHandler);

            this.finances_elements.finances_Gross_Percent = new LWC_Element('finances_Gross_Percent', this.template,  this.percentAttributeHandler);



            this.finances_elements.finances_Subtotal_After_Profit = new LWC_Element('finances_Subtotal_After_Profit', this.template, this.currencyAttributeHandler);


            this.finances_elements.finances_FET_Checkbox = new LWC_Input_Element('finances_FET_Checkbox', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });

            this.finances_elements.finances_12_FET = new LWC_Element('finances_12_FET', this.template, this.currencyAttributeHandler);

            this.finances_elements.finances_Minus_Tire_FET = new LWC_Input_Element('finances_Minus_Tire_FET', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Minus_Tire_FET.setApiFieldName('Minus_Tire_FET__c');

            this.finances_elements.finances_Total_FET = new LWC_Element('finances_Total_FET', this.template, this.currencyAttributeHandler);



            this.finances_elements.finances_Extended_Warranty = new LWC_Input_Element('finances_Extended_Warranty', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Extended_Warranty.setApiFieldName('Extended_Warranty__c');

            this.finances_elements.finances_Other_Fees = new LWC_Input_Element('finances_Other_Fees', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Other_Fees.setApiFieldName('Other_Fees__c');

            this.finances_elements.finances_Documentation_Fee = new LWC_Input_Element('finances_Documentation_Fee', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Documentation_Fee.setApiFieldName('Documentation_Fee__c');

            this.finances_elements.finances_Deposit = new LWC_Input_Element('finances_Deposit', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.finances_elements.finances_Deposit.setApiFieldName('Deposit__c');

            this.finances_elements.finances_Total = new LWC_Element('finances_Total', this.template, this.currencyAttributeHandler);
        }


        if(!this.tradeIn_elements) {
            this.tradeIn_elements = {};

            this.tradeIn_elements.tradeIn_Make = new LWC_Input_Element('tradeIn_Make', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.tradeIn_elements.tradeIn_Make.setApiFieldName('TradeIn_Make__c');

            this.tradeIn_elements.tradeIn_Model = new LWC_Input_Element('tradeIn_Model', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.tradeIn_elements.tradeIn_Model.setApiFieldName('TradeIn_Model__c');

            this.tradeIn_elements.tradeIn_Year = new LWC_Input_Element('tradeIn_Year', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.tradeIn_elements.tradeIn_Year.setApiFieldName('TradeIn_Year__c');

            this.tradeIn_elements.tradeIn_Unit_Number = new LWC_Input_Element('tradeIn_Unit_Number', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.tradeIn_elements.tradeIn_Unit_Number.setApiFieldName('TradeIn_Unit_Number__c');

            this.tradeIn_elements.tradeIn_Actual_Cash_Value = new LWC_Input_Element('tradeIn_Actual_Cash_Value', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.tradeIn_elements.tradeIn_Actual_Cash_Value.setApiFieldName('TradeIn_Actual_Cash_Value__c');

            this.tradeIn_elements.tradeIn_Billing_Amount = new LWC_Input_Element('tradeIn_Billing_Amount', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.tradeIn_elements.tradeIn_Billing_Amount.setApiFieldName('TradeIn_Billing_Amount__c');
        }


        if(!this.fetCredit_elements) {
            this.fetCredit_elements = {};

            this.fetCredit_elements.fetCredit_FET_Front_Description = new LWC_Input_Element('fetCredit_FET_Front_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.fetCredit_elements.fetCredit_FET_Front_Description.setApiFieldName('FET_Front_Description__c');

            this.fetCredit_elements.fetCredit_FET_Front_Size = new LWC_Input_Element('fetCredit_FET_Front_Size', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.fetCredit_elements.fetCredit_FET_Front_Size.setApiFieldName('FET_Front_Size__c');

            this.fetCredit_elements.fetCredit_FET_Front_Cost = new LWC_Input_Element('fetCredit_FET_Front_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.fetCredit_elements.fetCredit_FET_Front_Cost.setApiFieldName('FET_Front_Cost__c');

            this.fetCredit_elements.fetCredit_FET_Front_Quantity = new LWC_Input_Element('fetCredit_FET_Front_Quantity', this.template, this.numberAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.fetCredit_elements.fetCredit_FET_Front_Quantity.setApiFieldName('FET_Front_Quantity__c');

            this.fetCredit_elements.fetCredit_FET_Front_Subtotal = new LWC_Element('fetCredit_FET_Front_Subtotal', this.template, this.currencyAttributeHandler);


            this.fetCredit_elements.fetCredit_FET_Rear_Description = new LWC_Input_Element('fetCredit_FET_Rear_Description', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.fetCredit_elements.fetCredit_FET_Rear_Description.setApiFieldName('FET_Rear_Description__c');

            this.fetCredit_elements.fetCredit_FET_Rear_Size = new LWC_Input_Element('fetCredit_FET_Rear_Size', this.template, this.arbitraryAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.fetCredit_elements.fetCredit_FET_Rear_Size.setApiFieldName('FET_Rear_Size__c');

            this.fetCredit_elements.fetCredit_FET_Rear_Cost = new LWC_Input_Element('fetCredit_FET_Rear_Cost', this.template, this.currencyAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.fetCredit_elements.fetCredit_FET_Rear_Cost.setApiFieldName('FET_Rear_Cost__c');

            this.fetCredit_elements.fetCredit_FET_Rear_Quantity = new LWC_Input_Element('fetCredit_FET_Rear_Quantity', this.template, this.numberAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
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
        this.percentAttributeHandler = new Attribute_Handler('percent');

        this.toastHandler = new LWC_Toast(this);

        this.createLWC_Elements();
    }



    initializeLWC_Elements() {
        if(!this.whoWhat_elements.whoWhat_Salesman.isInitialized) {
            for(const key in this.whoWhat_elements) {
                this.whoWhat_elements[key].initialize();
            }

            // Default Salesman Lookup to Current User
            this.whoWhat_elements.whoWhat_Salesman.setAttribute('value', this.currentUser);
        }
        
        if(!this.finances_elements.finances_Chassis_Cost.isInitialized) {
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


    initializeFromAdmin(queryValues) {
        this.updateValuesFromQuery(this.whoWhat_elements, queryValues);

        this.updateValuesFromQuery(this.fetCredit_elements, queryValues);

        this.updateValuesFromQuery(this.tradeIn_elements, queryValues);

        this.updateValuesFromQuery(this.finances_elements, queryValues);


        this.makeFinancesCalculations();
    }


    initializeFromOpportunity(opportunityValues) {
        /*
        this.updateValuesFromOpportunity(this.whoWhat_elements, opportunityValues);

        this.updateValuesFromOpportunity(this.fetCredit_elements, opportunityValues);

        this.updateValuesFromOpportunity(this.tradeIn_elements, opportunityValues);

        this.updateValuesFromOpportunity(this.finances_elements, opportunityValues);
        */


        if(opportunityValues.Name) {
            this.whoWhat_elements.whoWhat_AdminName.setAttribute('value', opportunityValues.Name);

            this.whoWhat_elements.whoWhat_AdminName.setAttribute('disabled', true);


            this.whoWhat_elements.whoWhat_OpportunityLink.setAttribute('label', opportunityValues.Name);
            this.whoWhat_elements.whoWhat_OpportunityLink.setAttribute('attributes', {
                recordId: opportunityValues.Id,
                actionName: 'view'
            });
        }

        if(opportunityValues.OwnerId) {
            this.whoWhat_elements.whoWhat_Salesman.setAttribute('value', opportunityValues.OwnerId);
            
            this.whoWhat_elements.whoWhat_Salesman.setAttribute('disabled', true);
        }

        if(opportunityValues.Account) {
            if(opportunityValues.Account.Name) {
                this.whoWhat_elements.whoWhat_Customer.setAttribute('value', opportunityValues.Account.Name);

                this.whoWhat_elements.whoWhat_Customer.setAttribute('disabled', true);
            }
        }
        
        if(opportunityValues.Gross_Amount_s__c) {
            this.finances_elements.finances_Profit_Amount.setAttribute('value', opportunityValues.Gross_Amount_s__c);

            this.finances_elements.finances_Profit_Amount.setAttribute('disabled', true);

            this.finances_elements.finances_Profit_Percent.setAttribute('disabled', true);
        }

        if(opportunityValues.Doc_Fee__c) {
            this.finances_elements.finances_Documentation_Fee.setAttribute('value', opportunityValues.Doc_Fee__c);

            this.finances_elements.finances_Documentation_Fee.setAttribute('disabled', true);
        }

        if(opportunityValues.Deposit_Received__c) {
            this.finances_elements.finances_Deposit.setAttribute('value', opportunityValues.Deposit_Received__c);

            this.finances_elements.finances_Deposit.setAttribute('disabled', true);
        }

        if(opportunityValues.Total_PAC_Fees__c) {
            this.finances_elements.finances_Dealer_Pack.setAttribute('value', opportunityValues.Total_PAC_Fees__c);

            this.finances_elements.finances_Dealer_Pack.setAttribute('disabled', true);
        }


        this.makeFinancesCalculations();
    }


    initializeFromLineItems(lineItems) {
        for(const lineItemIndex in lineItems) {
            if(lineItems[lineItemIndex].Product2.RecordType.Name === 'Chassis') {
                this.whoWhat_elements.whoWhat_Chassis_VIN.setAttribute('value', lineItems[lineItemIndex].Product2.VIN__c);
                this.whoWhat_elements.whoWhat_Chassis_VIN.setAttribute('disabled', true);

                this.whoWhat_elements.whoWhat_Chassis_Make.setAttribute('value', lineItems[lineItemIndex].Product2.Chassis_Make__c);
                this.whoWhat_elements.whoWhat_Chassis_Make.setAttribute('disabled', true);

                this.whoWhat_elements.whoWhat_Chassis_Model.setAttribute('value', lineItems[lineItemIndex].Product2.Chassis_Model__c);
                this.whoWhat_elements.whoWhat_Chassis_Model.setAttribute('disabled', true);

                this.whoWhat_elements.whoWhat_Chassis_Year.setAttribute('value', lineItems[lineItemIndex].Product2.Year__c);
                this.whoWhat_elements.whoWhat_Chassis_Year.setAttribute('disabled', true);
            }


            if(lineItems[lineItemIndex].Product2.RecordType.Name === 'Service Body') {
                this.whoWhat_elements.whoWhat_Body_Series_Name.setAttribute('value', lineItems[lineItemIndex].Product2.Body_Model__c);
                this.whoWhat_elements.whoWhat_Body_Series_Name.setAttribute('disabled', true);
            }
        }

        this.makeFinancesCalculations();
    }


    initializeFromPOs(poLines) {
        let otherIndex = 1;

        let chassisPOFound = false;

        for(const poIndex in poLines) {
            if(poLines[poIndex].rstk__poline_item__r.rstk__poitem_comcod__r.Name.includes('CHASSIS')) {
                this.finances_elements.finances_Chassis_Cost.setAttribute('value', poLines[poIndex].rstk__poline_amtreq__c);
                this.finances_elements.finances_Chassis_Cost.setAttribute('disabled', true);


                //let oldDescription = this.finances_elements.finances_Chassis_Description.getAttribute('value');
                //this.finances_elements.finances_Chassis_Description.setAttribute('value', poLines[poIndex].rstk__poline_longdescr__c.concat(oldDescription));

                this.finances_elements.finances_Chassis_POInfo.setAttribute('label', poLines[poIndex].rstk__poline_longdescr__c);
                //this.finances_elements.finances_Chassis_POInfo.setAttribute('recordId', poLines[poIndex].Id);
                this.finances_elements.finances_Chassis_POInfo.setAttribute('attributes', {
                    recordId: poLines[poIndex].Id,
                    actionName: 'view'
                });

                chassisPOFound = true;
            }else if(poLines[poIndex].rstk__poline_item__r.rstk__poitem_comcod__r.Name.includes('BODY')) {
                if(poLines[poIndex].rstk__poline_longdescr__c.toLowerCase().includes('lube skid')) {
                    this.finances_elements['finances_Other_' + otherIndex + '_Cost'].setAttribute('value', poLines[poIndex].rstk__poline_amtreq__c);
                    this.finances_elements['finances_Other_' + otherIndex + '_Cost'].setAttribute('disabled', true);


                    //let oldDescription = this.finances_elements['finances_Other_' + otherIndex + '_Description'].getAttribute('value');
                    //this.finances_elements['finances_Other_' + otherIndex + '_Description'].setAttribute('value', poLines[poIndex].rstk__poline_longdescr__c.concat(oldDescription));

                    this.finances_elements['finances_Other_' + otherIndex + '_POInfo'].setAttribute('label', poLines[poIndex].rstk__poline_longdescr__c);
                    this.finances_elements['finances_Other_' + otherIndex + '_POInfo'].setAttribute('attributes', {
                        recordId: poLines[poIndex].Id,
                        actionName: 'view'
                    });

                    otherIndex += 1;
                }else {
                    this.finances_elements.finances_Body_Cost.setAttribute('value', poLines[poIndex].rstk__poline_amtreq__c);
                    this.finances_elements.finances_Body_Cost.setAttribute('disabled', true);


                    //let oldDescription = this.finances_elements.finances_Body_Description.getAttribute('value');
                    //this.finances_elements.finances_Body_Description.setAttribute('value', poLines[poIndex].rstk__poline_longdescr__c.concat(oldDescription));

                    this.finances_elements.finances_Body_POInfo.setAttribute('label', poLines[poIndex].rstk__poline_longdescr__c);
                    this.finances_elements.finances_Body_POInfo.setAttribute('attributes', {
                        recordId: poLines[poIndex].Id,
                        actionName: 'view'
                    });
                }
            }else if(poLines[poIndex].rstk__poline_longdescr__c.toLowerCase().includes('freight')) {
                this.finances_elements.finances_Freight_Cost.setAttribute('value', poLines[poIndex].rstk__poline_amtreq__c);
                this.finances_elements.finances_Freight_Cost.setAttribute('disabled', true);


                //let oldDescription = this.finances_elements.finances_Freight_Description.getAttribute('value');
                //this.finances_elements.finances_Freight_Description.setAttribute('value', poLines[poIndex].rstk__poline_longdescr__c.concat(oldDescription));

                this.finances_elements.finances_Freight_POInfo.setAttribute('label', poLines[poIndex].rstk__poline_longdescr__c);
                this.finances_elements.finances_Freight_POInfo.setAttribute('attributes', {
                    recordId: poLines[poIndex].Id,
                    actionName: 'view'
                });
            }else if(poLines[poIndex].rstk__poline_longdescr__c.toLowerCase().includes('a order')) {
                this.finances_elements.finances_AOrder_Cost.setAttribute('value', poLines[poIndex].rstk__poline_amtreq__c);
                this.finances_elements.finances_AOrder_Cost.setAttribute('disabled', true);


                //let oldDescription = this.finances_elements.finances_AOrder_Description.getAttribute('value');
                //this.finances_elements.finances_AOrder_Description.setAttribute('value', poLines[poIndex].rstk__poline_longdescr__c.concat(oldDescription));

                this.finances_elements.finances_AOrder_POInfo.setAttribute('label', poLines[poIndex].rstk__poline_longdescr__c);
                this.finances_elements.finances_AOrder_POInfo.setAttribute('attributes', {
                    recordId: poLines[poIndex].Id,
                    actionName: 'view'
                });
            }else {
                this.finances_elements['finances_Other_' + otherIndex + '_Cost'].setAttribute('value', poLines[poIndex].rstk__poline_amtreq__c);
                this.finances_elements['finances_Other_' + otherIndex + '_Cost'].setAttribute('disabled', true);


                //let oldDescription = this.finances_elements['finances_Other_' + otherIndex + '_Description'].getAttribute('value');
                //this.finances_elements['finances_Other_' + otherIndex + '_Description'].setAttribute('value', poLines[poIndex].rstk__poline_longdescr__c.concat(oldDescription));

                this.finances_elements['finances_Other_' + otherIndex + '_POInfo'].setAttribute('label', poLines[poIndex].rstk__poline_longdescr__c);
                    this.finances_elements['finances_Other_' + otherIndex + '_POInfo'].setAttribute('attributes', {
                        recordId: poLines[poIndex].Id,
                        actionName: 'view'
                    });

                otherIndex += 1;
            }
        }


        // If I didn't find a Chassis PO then check Products for the Chassis, and if I find a Chassis then let Dianne
        // known that there was a Product but not a Chassis
        if(!chassisPOFound) {
            for(const oppProductIndex in this.oppProducts) {
                if(this.oppProducts[oppProductIndex].Product2.RecordType.Name === 'Chassis') {
                    this.finances_elements.finances_Chassis_Cost.setAttribute('value', this.oppProducts[oppProductIndex].Sales_Price_w_o_FET__c);
                    this.finances_elements.finances_Chassis_Cost.setAttribute('disabled', true);

                    chassisPOFound = true;
                } 
            }

            // In the case that there isn't a Chassis do something here like, put no Chassis in the description or something
            if(!chassisPOFound) {

            }
        }


        this.makeFinancesCalculations();
    }


    renderedCallback() {
        if(!this.defaultAdminChecklist) {
            this.queryAdminChecklist_Defaults().then(() => {
                this.initializeLWC_Elements();


                this.initializeFromAdmin(this.defaultAdminChecklist);


                let page_url = new URL(window.location.href);
                let urlParamOppId = page_url.searchParams.get("c__AdminChosen");
                if (urlParamOppId) {
                    this.adminChosen = urlParamOppId;

                    this.handleAdminChosen();
                }
            }).catch(err => {
                this.toastHandler.displayError('Error in call to then after queryAdminChecklist_Defaults!', '(admin_in_opportunity) Something went wrong, see console log for more info', err);
            });
        }

        /*
        if(this.opportunity && !this.opportunityLink) {
            this.opportunityLink = this.template.querySelector("[data-id='OpportunityLink']");

            this.opportunityLink['label'] = this.opportunityData.Name;

            this.opportunityLink['attributes'] = {
                recordId: this.opportunityData.Id,
                actionName: 'view'
            }
        }
        */
    }
}