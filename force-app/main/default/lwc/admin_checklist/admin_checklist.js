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

    lineItemsData;

    poData;


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
        if(this.finances_elements.finances_FET_Checkbox.getAttribute('checked') == true) {
            this.finances_elements.finances_12_FET.setAttribute(
                'value',
    
                Math.round( (this.finances_elements.finances_Subtotal_After_Profit.getAttribute('value') * 0.12) * 100) / 100
            );

            this.finances_elements.finances_Total_FET.setAttribute(
                'value',

                this.finances_elements.finances_12_FET.getAttribute('value') -
                this.finances_elements.finances_Minus_Tire_FET.getAttribute('value')
            );
        }else {
            this.finances_elements.finances_12_FET.setAttribute(
                'value',
    
                0.00
            );

            this.finances_elements.finances_Total_FET.setAttribute(
                'value',

                0.00
            );
        }
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


    handleApplyFET() {
        this.makeFinancesCalculations();
    }


    handleAdminChosen(event) {
        // For when the admin search passes the admin to me through the event detail
        if(event) {
            this.adminChosen = event.detail.value;
        }

        // First and foremost, since my fallback data comes from the AdminChecklist itself, I need to go ahead
        // and query all that data then start working on the rest of the data and will just use these when the 
        // other options don't exist

        let adminString = 
            'SELECT Name__c, Salesman__c, Customer_Name__c, Chassis_Year__c, Chassis_Make__c, Chassis_VIN__c, Chassis_Model__c, Date__c, Body_Series_Name__c, Chassis_Cost__c, Chassis_Description__c, Body_Cost__c, Body_Description__c, Freight_Cost__c, Freight_Description__c, AOrder_Cost__c, AOrder_Description__c, Other_1_Cost__c, Other_1_Description__c, Other_2_Cost__c, Other_2_Description__c, Other_3_Cost__c, Other_3_Description__c, Other_4_Cost__c, Other_4_Description__c, Other_5_Cost__c, Other_5_Description__c, Profit_Amount__c, Dealer_Pack__c, Minus_Tire_FET__c, Extended_Warranty__c, Other_Fees__c, Documentation_Fee__c, Deposit__c, TradeIn_Make__c, TradeIn_Year__c, TradeIn_Model__c, TradeIn_Unit_Number__c, TradeIn_Actual_Cash_Value__c, TradeIn_Billing_Amount__c, FET_Front_Description__c, FET_Front_Size__c, FET_Front_Cost__c, FET_Front_Quantity__c, FET_Rear_Description__c, FET_Rear_Size__c, FET_Rear_Cost__c, FET_Rear_Quantity__c' +
            ' FROM AdminChecklist__c ' +
            ' WHERE Id = \'' + this.adminChosen + '\'';

        queryFromString({ queryString: adminString }).then(adminRecords => {
            if(adminRecords.length > 0) {
                // Since I used the Id, this will be the only Admin I get
                // Also, this data is needed within the inner "then"s so this is the globalized version
                this.adminData = adminRecords[0];

                // Go ahead and set the Descriptions since those won't be overwritten
                this.finances_elements.finances_Chassis_Description.setAttribute('value', this.adminData.Chassis_Description__c);
                this.finances_elements.finances_Body_Description.setAttribute('value', this.adminData.Body_Description__c);
                this.finances_elements.finances_Freight_Description.setAttribute('value', this.adminData.Freight_Description__c);
                this.finances_elements.finances_AOrder_Description.setAttribute('value', this.adminData.AOrder_Description__c);
                this.finances_elements.finances_Other_1_Description.setAttribute('value', this.adminData.Other_1_Description__c);
                this.finances_elements.finances_Other_2_Description.setAttribute('value', this.adminData.Other_2_Description__c);
                this.finances_elements.finances_Other_3_Description.setAttribute('value', this.adminData.Other_3_Description__c);
                this.finances_elements.finances_Other_4_Description.setAttribute('value', this.adminData.Other_4_Description__c);
                this.finances_elements.finances_Other_5_Description.setAttribute('value', this.adminData.Other_5_Description__c);



                // Now go ahead and fill out the rest of everything else with the Admin Checklist and
                // if down the road it can be replaced we will replace it with the higher ranking value
                // but otherwise it falls back on these values without getting bogged down in double entry
                // within the else statements
                
                // Who What Fields
                this.whoWhat_elements.whoWhat_AdminName.setAttribute('value', this.adminData.Name__c);
                this.whoWhat_elements.whoWhat_Salesman.setAttribute('value', this.adminData.Salesman__c);
                this.whoWhat_elements.whoWhat_Customer.setAttribute('value', this.adminData.Customer_Name__c);

                this.whoWhat_elements.whoWhat_Chassis_Year.setAttribute('value', this.adminData.Chassis_Year__c);
                this.whoWhat_elements.whoWhat_Chassis_Make.setAttribute('value', this.adminData.Chassis_Make__c);
                this.whoWhat_elements.whoWhat_Chassis_VIN.setAttribute('value', this.adminData.Chassis_VIN__c);
                this.whoWhat_elements.whoWhat_Chassis_Model.setAttribute('value', this.adminData.Chassis_Model__c);

                this.whoWhat_elements.whoWhat_Body_Series_Name.setAttribute('value', this.adminData.Body_Series_Name__c);


                // Finances Fields
                this.finances_elements.finances_Chassis_Cost.setAttribute('value', this.adminData.Chassis_Cost__c);
                this.finances_elements.finances_Body_Cost.setAttribute('value', this.adminData.Body_Cost__c);
                this.finances_elements.finances_Freight_Cost.setAttribute('value', this.adminData.Freight_Cost__c);
                this.finances_elements.finances_AOrder_Cost.setAttribute('value', this.adminData.AOrder_Cost__c);
                this.finances_elements.finances_Other_1_Cost.setAttribute('value', this.adminData.Other_1_Cost__c);
                this.finances_elements.finances_Other_2_Cost.setAttribute('value', this.adminData.Other_2_Cost__c);
                this.finances_elements.finances_Other_3_Cost.setAttribute('value', this.adminData.Other_3_Cost__c);
                this.finances_elements.finances_Other_4_Cost.setAttribute('value', this.adminData.Other_4_Cost__c);
                this.finances_elements.finances_Other_5_Cost.setAttribute('value', this.adminData.Other_5_Cost__c);

                this.finances_elements.finances_Profit_Amount.setAttribute('value', this.adminData.Profit_Amount__c);
                this.finances_elements.finances_Dealer_Pack.setAttribute('value', this.adminData.Dealer_Pack__c);

                this.finances_elements.finances_Minus_Tire_FET.setAttribute('value', this.adminData.Minus_Tire_FET__c);

                this.finances_elements.finances_Extended_Warranty.setAttribute('value', this.adminData.Extended_Warranty__c);
                this.finances_elements.finances_Other_Fees.setAttribute('value', this.adminData.Other_Fees__c);
                this.finances_elements.finances_Documentation_Fee.setAttribute('value', this.adminData.Documentation_Fee__c);
                this.finances_elements.finances_Deposit.setAttribute('value', this.adminData.Deposit__c);


                // Trade In Fields
                this.tradeIn_elements.tradeIn_Make.setAttribute('value', this.adminData.TradeIn_Make__c);
                this.tradeIn_elements.tradeIn_Model.setAttribute('value', this.adminData.TradeIn_Model__c);
                this.tradeIn_elements.tradeIn_Year.setAttribute('value', this.adminData.TradeIn_Year__c);
                this.tradeIn_elements.tradeIn_Unit_Number.setAttribute('value', this.adminData.TradeIn_Unit_Number__c);
                this.tradeIn_elements.tradeIn_Actual_Cash_Value.setAttribute('value', this.adminData.TradeIn_Actual_Cash_Value__c);
                this.tradeIn_elements.tradeIn_Billing_Amount.setAttribute('value', this.adminData.TradeIn_Billing_Amount__c);


                // F.E.T. Fields
                this.fetCredit_elements.fetCredit_FET_Front_Description.setAttribute('value', this.adminData.FET_Front_Description__c);
                this.fetCredit_elements.fetCredit_FET_Front_Size.setAttribute('value', this.adminData.FET_Front_Size__c);
                this.fetCredit_elements.fetCredit_FET_Front_Cost.setAttribute('value', this.adminData.FET_Front_Cost__c);
                this.fetCredit_elements.fetCredit_FET_Front_Quantity.setAttribute('value', this.adminData.FET_Front_Quantity__c);
                
                this.fetCredit_elements.fetCredit_FET_Rear_Description.setAttribute('value', this.adminData.FET_Rear_Description__c);
                this.fetCredit_elements.fetCredit_FET_Rear_Size.setAttribute('value', this.adminData.FET_Rear_Size__c);
                this.fetCredit_elements.fetCredit_FET_Rear_Cost.setAttribute('value', this.adminData.FET_Rear_Cost__c);
                this.fetCredit_elements.fetCredit_FET_Rear_Quantity.setAttribute('value', this.adminData.FET_Rear_Quantity__c);


                this.makeFinancesCalculations();


                // Next up is to go fetch the Opportunity and determine if it exists, fill in values, etc. 
                queryFromString({ 
                    queryString: 'SELECT Id, Name, OwnerId, Account.Name, Gross_Amount_s__c, Deposit_Received__c, Doc_Fee__c, Total_PAC_Fees__c' +
                    ' FROM Opportunity ' +
                    ' WHERE AdminChecklist__c=\'' + this.adminChosen + '\''
                }).then(opportunityRecords => {
                    // There should only be 1 Opportunity per Admin, but since Salesforce doesn't have 1-1 go ahead and 
                    // check for the rare case that the workaround to the 1-1 problem has a loophole
                    if(opportunityRecords.length == 1) {
                        this.opportunityData = opportunityRecords[0];

                        // Fill out those parts of the Opportunity that won't be overwritten by the higher up data
                        // if they are there, otherwise use the adminchecklist for that value
                        if(this.opportunityData.Name) {
                            this.whoWhat_elements.whoWhat_AdminName.setAttribute('value', this.opportunityData.Name);

                            this.whoWhat_elements.whoWhat_AdminName.setAttribute('disabled', true);

                            this.whoWhat_elements.whoWhat_OpportunityLink.setAttribute('label', this.opportunityData.Name);

                            this.whoWhat_elements.whoWhat_OpportunityLink.setAttribute('attributes', {
                                recordId: this.opportunityData.Id,
                                actionName: 'view'
                            });
                        }

                        if(this.opportunityData.OwnerId) {
                            this.whoWhat_elements.whoWhat_Salesman.setAttribute('value', this.opportunityData.OwnerId);

                            this.whoWhat_elements.whoWhat_Salesman.setAttribute('disabled', true);
                        }

                        if(this.opportunityData.Account.Name) {
                            this.whoWhat_elements.whoWhat_Customer.setAttribute('value', this.opportunityData.Account.Name);

                            this.whoWhat_elements.whoWhat_Customer.setAttribute('disabled', true);
                        }

                        if(this.opportunityData.Gross_Amount_s__c) {
                            this.finances_elements.finances_Profit_Amount.setAttribute('value', this.opportunityData.Gross_Amount_s__c);

                            this.finances_elements.finances_Profit_Amount.setAttribute('disabled', true);

                            this.finances_elements.finances_Profit_Percent.setAttribute('disabled', true);
                        }

                        if(this.opportunityData.Total_PAC_Fees__c) {
                            this.finances_elements.finances_Dealer_Pack.setAttribute('value', this.opportunityData.Total_PAC_Fees__c);

                            this.finances_elements.finances_Dealer_Pack.setAttribute('disabled', true);
                        }

                        if(this.opportunityData.Doc_Fee__c) {
                            this.finances_elements.finances_Documentation_Fee.setAttribute('value', this.opportunityData.Doc_Fee__c);

                            this.finances_elements.finances_Documentation_Fee.setAttribute('disabled', true);
                        }

                        if(this.opportunityData.Deposit_Received__c) {
                            this.finances_elements.finances_Deposit.setAttribute('value', this.opportunityData.Deposit_Received__c);

                            this.finances_elements.finances_Deposit.setAttribute('disabled', true);
                        }


                        this.makeFinancesCalculations();


                        // Now go get the Products associated with this Opportunity then the POs then start filling in etc.
                        getProducts({ oppId: this.opportunityData.Id }).then(lineItemRecords => {
                            if(lineItemRecords.length > 0) {
                                this.lineItemsData = lineItemRecords;


                                for(let index in this.lineItemsData) {
                                    if(this.lineItemsData[index].Product2.RecordType.Name === 'Chassis') {
                                        this.whoWhat_elements.whoWhat_Chassis_Year.setAttribute('value', this.lineItemsData[index].Product2.Year__c);

                                        this.whoWhat_elements.whoWhat_Chassis_Year.setAttribute('disabled', true);


                                        this.whoWhat_elements.whoWhat_Chassis_Make.setAttribute('value', this.lineItemsData[index].Product2.Chassis_Make__c);

                                        this.whoWhat_elements.whoWhat_Chassis_Make.setAttribute('disabled', true);


                                        this.whoWhat_elements.whoWhat_Chassis_VIN.setAttribute('value', this.lineItemsData[index].Product2.VIN__c);

                                        this.whoWhat_elements.whoWhat_Chassis_VIN.setAttribute('disabled', true);


                                        this.whoWhat_elements.whoWhat_Chassis_Model.setAttribute('value', this.lineItemsData[index].Product2.Chassis_Model__c);

                                        this.whoWhat_elements.whoWhat_Chassis_Model.setAttribute('disabled', true);


                                        // If we have the Cost for the Chassis from the Product go ahead and use that
                                        // and it will be the fallback for when we don't have a PO Line to find the cost with
                                        this.finances_elements.finances_Chassis_Cost.setAttribute('value', this.lineItemsData[index].Total_Product_Cost__c);

                                        this.finances_elements.finances_Chassis_Cost.setAttribute('disabled', true);
                                    }else if(this.lineItemsData[index].Product2.RecordType.Name === 'Service Body') {
                                        // Go ahead and replace the Body Series Name with the Body Products Name
                                        this.whoWhat_elements.whoWhat_Body_Series_Name.setAttribute('value', this.lineItemsData[index].Product2.Body_Model__c);

                                        this.whoWhat_elements.whoWhat_Body_Series_Name.setAttribute('disabled', true);
                                    }
                                }


                                this.makeFinancesCalculations();


                                // Now get the PO Lines
                                getPOs({ lineItems: this.lineItemsData }).then(poRecords => {
                                    if(poRecords.length > 0) {
                                        this.poData = poRecords;

                                        let otherIndex = 1;

                                        for(let index in this.poData) {
                                            if(this.poData[index].rstk__poline_item__r.rstk__poitem_comcod__r.Name.includes('CHASSIS')) {
                                                this.finances_elements.finances_Chassis_Cost.setAttribute('value', this.poData[index].rstk__poline_amtreq__c);

                                                this.finances_elements.finances_Chassis_Cost.setAttribute('disabled', true);


                                                this.finances_elements.finances_Chassis_POInfo.setAttribute('label', this.poData[index].rstk__poline_longdescr__c);

                                                this.finances_elements.finances_Chassis_POInfo.setAttribute('attributes', {
                                                    recordId: this.poData[index].Id,
                                                    actionName: 'view'
                                                });
                                            }else if(this.poData[index].rstk__poline_item__r.rstk__poitem_comcod__r.Name.includes('BODY')) {
                                                if(this.poData[index].rstk__poline_longdescr__c.toLowerCase().includes('lube skid') || this.poData[index].rstk__poline_longdescr__c.toLowerCase().includes('lubeskid')) {
                                                    this.finances_elements['finances_Other_' + otherIndex + '_Cost'].setAttribute('value', this.poData[index].rstk__poline_amtreq__c);
                                                    
                                                    this.finances_elements['finances_Other_' + otherIndex + '_Cost'].setAttribute('disabled', true);
                                
                                
                                                    this.finances_elements['finances_Other_' + otherIndex + '_POInfo'].setAttribute('label', this.poData[index].rstk__poline_longdescr__c);

                                                    this.finances_elements['finances_Other_' + otherIndex + '_POInfo'].setAttribute('attributes', {
                                                        recordId: this.poData[index].Id,
                                                        actionName: 'view'
                                                    });
                                
                                                    otherIndex += 1;
                                                }else {
                                                    this.finances_elements.finances_Body_Cost.setAttribute('value', this.poData[index].rstk__poline_amtreq__c);

                                                    this.finances_elements.finances_Body_Cost.setAttribute('disabled', true);
                                
                                
                                                    this.finances_elements.finances_Body_POInfo.setAttribute('label', this.poData[index].rstk__poline_longdescr__c);

                                                    this.finances_elements.finances_Body_POInfo.setAttribute('attributes', {
                                                        recordId: this.poData[index].Id,
                                                        actionName: 'view'
                                                    });
                                                }
                                            }else if(this.poData[index].rstk__poline_longdescr__c.toLowerCase().includes('freight')) {
                                                this.finances_elements.finances_Freight_Cost.setAttribute('value', this.poData[index].rstk__poline_amtreq__c);

                                                this.finances_elements.finances_Freight_Cost.setAttribute('disabled', true);
                                
                                
                                                this.finances_elements.finances_Freight_POInfo.setAttribute('label', this.poData[index].rstk__poline_longdescr__c);

                                                this.finances_elements.finances_Freight_POInfo.setAttribute('attributes', {
                                                    recordId: this.poData[index].Id,
                                                    actionName: 'view'
                                                });
                                            }else if(this.poData[index].rstk__poline_longdescr__c.toLowerCase().includes('a order') || this.poData[index].rstk__poline_longdescr__c.toLowerCase().includes('a  order') || this.poData[index].rstk__poline_longdescr__c.toLowerCase().includes('a-order')) {
                                                this.finances_elements.finances_AOrder_Cost.setAttribute('value', this.poData[index].rstk__poline_amtreq__c);

                                                this.finances_elements.finances_AOrder_Cost.setAttribute('disabled', true);
                                
                                
                                                this.finances_elements.finances_AOrder_POInfo.setAttribute('label', this.poData[index].rstk__poline_longdescr__c);

                                                this.finances_elements.finances_AOrder_POInfo.setAttribute('attributes', {
                                                    recordId: this.poData[index].Id,
                                                    actionName: 'view'
                                                });
                                            }else {
                                                this.finances_elements['finances_Other_' + otherIndex + '_Cost'].setAttribute('value', this.poData[index].rstk__poline_amtreq__c);

                                                this.finances_elements['finances_Other_' + otherIndex + '_Cost'].setAttribute('disabled', true);
                                
                                
                                                this.finances_elements['finances_Other_' + otherIndex + '_POInfo'].setAttribute('label', this.poData[index].rstk__poline_longdescr__c);

                                                    this.finances_elements['finances_Other_' + otherIndex + '_POInfo'].setAttribute('attributes', {
                                                        recordId: this.poData[index].Id,
                                                        actionName: 'view'
                                                    });
                                
                                                otherIndex += 1;
                                            }
                                        

                                        }


                                        this.makeFinancesCalculations();
                                    }else {
                                        // . . . ..................................................................
                                        // . . .  ...................................................................
                                    }
                                }).catch(err => {
                                    this.toastHandler.displayError('Error occurred while trying to find the Purchase Order Lines for the Opportunity!', '(admin_in_opportunity) See console log for more details', err);
                                });
                            }else {
                                // Just in case they haven't added the products yet, let them know no products were found
                                this.toastHandler.displayChoice('Note: No Products were found that belong to this Opportunity', 'No big deal, but the data you see will only be pulled from the Admin Checklist and the Opportunity until the Products are added to the Opportunity', 'warning', 'sticky');
                            }
                        }).catch(err => {
                            this.toastHandler.displayError('Error occurred while trying to find the Products for the Opportunity!', '(admin_in_opportunity) See console log for more details', err);
                        });
                    }else if(opportunityRecords.length > 1) {
                // . . . ......................................................................
                // . . . ......................................................................
                    }else {
                        // Just in case they set the wrong Opportunity, give this warning when no Opportunity found
                        this.toastHandler.displayChoice('Note: An Opportunity was not found that owns this Admin', 'No big deal, but if this Admin is supposed to belong to an already existing Opportunity, then go to that Opportunity and check if you selected the correct Admin.', 'warning', 'sticky');
                    }
                }).catch(err => {
                    this.toastHandler.displayError('Error occurred while trying to find the Opportuninty!', '(admin_in_opportunity) See console log for more details', err);
                });

            }else {
                this.toastHandler.displayChoice('Could not find this specified Admin!', '(admin_in_opportunity) Length of records return by queryFromString for AdminChecklist__c in handleAdminChosen is 0', 'error', 'sticky');
            }
        }).catch(err => {
            this.toastHandler.displayError('Error occurred while trying to find the Admin!', '(admin_in_opportunity) See console log for more details', err);
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
if(key === 'tradeIn_Actual_Cash_Value') {
    console.log('Actual Cash Value . . .');
    console.log(fieldObject[key].getAttribute('value'));
    console.log(fieldObject[key].apiFieldName);
    console.log('. . .');
}
            if(fieldObject[key].apiFieldName) {
                // Need to 'or' with the empty string case because '' is considered to be falsy and won't save making
                // it impossible to remove a comment
                if(fieldObject[key].getAttribute('value') || fieldObject[key].getAttribute('value') === '' || fieldObject[key].getAttribute('value') === 0) {
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
                // do nothing on focus out of checking Apply FET
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

            this.tradeIn_elements.tradeIn_Actual_Cash_Value = new LWC_Input_Element('tradeIn_Actual_Cash_Value', this.template, this.numberAttributeHandler, (event) => {
                this.handleDOMInput(event)
            });
            this.tradeIn_elements.tradeIn_Actual_Cash_Value.setApiFieldName('TradeIn_Actual_Cash_Value__c');

            this.tradeIn_elements.tradeIn_Billing_Amount = new LWC_Input_Element('tradeIn_Billing_Amount', this.template, this.numberAttributeHandler, (event) => {
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


    renderedCallback() {
        if(!this.defaultAdminChecklist) {
            this.queryAdminChecklist_Defaults().then(() => {
                this.initializeLWC_Elements();


                this.initializeFromAdmin(this.defaultAdminChecklist);

                if(this.currentUser) {
                    // Default Salesman Lookup to Current User
                    // MUST BE AFTER initializeFromAdmin and initializeLWC_Elements or it will be overwritten
                    this.whoWhat_elements.whoWhat_Salesman.setAttribute('value', this.currentUser);
                }


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
    }
}