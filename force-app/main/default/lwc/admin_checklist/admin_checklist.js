
import { LightningElement, track } from 'lwc';

import { LWC_Toast } from "c/lwc_generic_prototype";

import queryFromString from "@salesforce/apex/Apex_Generic_Prototype.queryFromString";
import insertRecords from "@salesforce/apex/Apex_Generic_Prototype.insertRecords";

import { View } from "c/lwc_mvc_prototype2";

import getPOs from '@salesforce/apex/AdminChecklist_Controller.getPOs';



export default class Admin_checklist extends LightningElement {
    @track poDynamicList;

    adminChosen;
    opportunityId;

    toast;

    view;


    constructor() {
        super();


        this.view = new View();

        this.toast = new LWC_Toast(this.template);

        this.poDynamicList = [];

    // -----------------------------------------------------------------------
    // This will be moved to where this is only added if an admin isn't found, etc. 
        this.addToPOList('Chassis', 0, '');
        this.addToPOList('Body', 0, '');
        this.addToPOList('Freight', 0, '');
    // -----------------------------------------------------------------------
    }


    addToPOList(title, cost, description) {
        this.poDynamicList.push({
            index: this.poDynamicList.length,

            dataIdTitle: 'title_' + this.poDynamicList.length,
            title: title,

            dataIdCost: 'cost_' + this.poDynamicList.length,
            cost: cost,

            dataIdDescription: 'description_' + this.poDynamicList.length,
            description: description,

            dataIdRemoveButton: 'remove_' + this.poDynamicList.length,

            disabled: false,

            lineDescription: ''
        });
    }

    updatePODynamicIndices() {
        for(let i = 0; i < this.poDynamicList.length; i++) {
            this.poDynamicList[i].index = i;

            this.poDynamicList[i].dataIdTitle = 'title_' + i;

            this.poDynamicList[i].dataIdCost = 'cost_' + i;

            this.poDynamicList[i].dataIdDescription = 'description_' + i;

            this.poDynamicList[i].dataIdRemoveButton = 'remove_' + i;
        }
    }

    setInitials_AddPO() {
        this.view.setAttribute('AddPOTitle', 'value', '');
        this.view.setAttribute('AddPOCost', 'value', 0);
        this.view.setAttribute('AddPODescription', 'value', '')
    }


    calculatePOSubtotal() {
        let sum = 0;

        for(let i in this.poDynamicList) {
            sum += Number(this.view.getAttribute('cost_' + i, 'value'));
        }

        this.view.setAttribute('finances_POSubtotal', 'value', sum);
    }


    calculateProfitPercent() {
        let sum = Number(this.view.getAttribute('finances_Profit_Amount', 'value')) / ( Number(this.view.getAttribute('finances_POSubtotal', 'value')) + Number(this.view.getAttribute('finances_Profit_Amount', 'value')) );

        this.view.setAttribute('finances_Profit_Percent', 'value', sum.toFixed(4));
    }
    calculateProfitAmount() {
        let sum = Number(this.view.getAttribute('finances_POSubtotal', 'value')) * Number(this.view.getAttribute('finances_Profit_Percent', 'value'));

        this.view.setAttribute('finances_Profit_Amount', 'value', sum);
    }


    calculateGrossesAfterCommision() {
        let sum = Number(this.view.getAttribute('finances_Profit_Amount', 'value'));
        sum -= Number(this.view.getAttribute('finances_Dealer_Pack', 'value'));

        this.view.setAttribute('finances_Gross_Amount', 'value', sum);

        this.view.setAttribute(
            'finances_Gross_Percent',

            'value',

            sum / ( Number(this.view.getAttribute('finances_POSubtotal', 'value')) + Number(this.view.getAttribute('finances_Profit_Amount', 'value')) )
        );
    }


    calculateSubtotalAfterProfit() {
        let sum = Number(this.view.getAttribute('finances_POSubtotal', 'value'));
        sum += Number(this.view.getAttribute('finances_Profit_Amount', 'value'));

        this.view.setAttribute('finances_Subtotal_After_Profit', 'value', sum);
    }


    calculateAppliedFET() {
        let sum = 0;

        if(this.view.getAttribute('finances_FET_Checkbox', 'checked')) {
            // 12% of Subototal to 2 decimal places
            this.view.setAttribute(
                'finances_12_FET',
                'value',
                Math.round( (Number(this.view.getAttribute('finances_Subtotal_After_Profit', 'value')) * 0.12) * 100) / 100
            );
        }else {
            this.view.setAttribute('finances_12_FET', 'value', 0);
        }

        sum = Number(this.view.getAttribute('finances_12_FET', 'value'));

        sum -= Number(this.view.getAttribute('finances_Minus_Tire_FET', 'value'));

        this.view.setAttribute('finances_Total_FET', 'value', sum);
    }


    calculateRestOfTotal() {
        let sum = 0;

        sum += Number(this.view.getAttribute('finances_Subtotal_After_Profit', 'value'));
        sum += Number(this.view.getAttribute('finances_Total_FET', 'value'));
        sum += Number(this.view.getAttribute('finances_Extended_Warranty', 'value'));
        sum += Number(this.view.getAttribute('finances_Other_Fees', 'value'));
        sum += Number(this.view.getAttribute('finances_Documentation_Fee', 'value'));
        sum -= Number(this.view.getAttribute('finances_Deposit', 'value'));

        this.view.setAttribute('finances_Total', 'value', sum);
    }


    updateFinanceCalculations() {
        this.calculatePOSubtotal();
        this.calculateProfitPercent();
        this.calculateGrossesAfterCommision();
        this.calculateSubtotalAfterProfit();
        this.calculateAppliedFET();  
        this.calculateRestOfTotal();
    }
    updateFinanceCalculationsAfterPercent() {
        this.calculatePOSubtotal();
        this.calculateProfitAmount();
        this.calculateGrossesAfterCommision();
        this.calculateSubtotalAfterProfit();
        this.calculateAppliedFET();  
        this.calculateRestOfTotal();
    }


    calculateFETTotals() {
        this.view.setAttribute(
            'fetCredit_FET_Front_Subtotal',
            'value',
            this.view.getAttribute('fetCredit_FET_Front_Cost', 'value') * this.view.getAttribute('fetCredit_FET_Front_Quantity', 'value')
        );

        this.view.setAttribute(
            'fetCredit_FET_Rear_Subtotal',
            'value',
            this.view.getAttribute('fetCredit_FET_Rear_Cost', 'value') * this.view.getAttribute('fetCredit_FET_Rear_Quantity', 'value')
        );

        this.view.setAttribute(
            'fetCredit_FET_Total',
            'value',
            this.view.getAttribute('fetCredit_FET_Front_Subtotal', 'value') + this.view.getAttribute('fetCredit_FET_Rear_Subtotal', 'value')
        );
    }

    
    getAdminInURL() {
        let urlParamAdmin = null;

        try {
            let page_url = new URL(window.location.href);
            
            urlParamAdmin = page_url.searchParams.get("c__AdminChosen");
        }catch(err) {
            this.toast.displayError(err.message);
        }


        return urlParamAdmin;
    }

    
    connectedCallback() {
        let urlParamAdmin = this.getAdminInURL();
        if (urlParamAdmin) {
            this.adminChosen = urlParamAdmin;

            this.handleAdminChosen();
        }
    }


    queryAdminChosen() {
        return queryFromString({
            queryString:
                "SELECT Name__c, Salesman__c, Customer_Name__c, Chassis_Year__c, Chassis_Make__c, Chassis_VIN__c, Chassis_Model__c, Date__c, Body_Series_Name__c, Profit_Amount__c, Dealer_Pack__c, ApplyFET__c, Minus_Tire_FET__c, Extended_Warranty__c, Other_Fees__c, Documentation_Fee__c, Deposit__c, TradeIn_Make__c, TradeIn_Year__c, TradeIn_Model__c, TradeIn_Unit_Number__c, TradeIn_Actual_Cash_Value__c, TradeIn_Billing_Amount__c, FET_Front_Description__c, FET_Front_Size__c, FET_Front_Cost__c, FET_Front_Quantity__c, FET_Rear_Description__c, FET_Rear_Size__c, FET_Rear_Cost__c, FET_Rear_Quantity__c" +
                " FROM AdminChecklist__c" +
                " WHERE Id='" + this.adminChosen + "'"
        });
    }

    queryAdminPOs() {
        return queryFromString({
            queryString:
                "SELECT Title__c, Cost__c, Description__c" +
                " FROM AdminPO__c" +
                " WHERE AdminChecklist__c='" + this.adminChosen + "'"
        });
    }


    queryOpportunity() {
        return queryFromString({
            queryString:
                "SELECT Id, Name, OwnerId, Account.Name, Gross_Amount_s__c, Deposit_Received__c, Doc_Fee__c, Total_PAC_Fees__c, Total_Actual_Cash_Value__c" +
                " FROM Opportunity" +
                " WHERE AdminChecklist__c='" + this.adminChosen + "'"
        });
    }

    queryProducts() {
        return queryFromString({
            queryString:
                "SELECT Product2.Name, Product2.VIN__c, Product2.VIN_Last_6__c, Product2.RecordType.Name, Product2.Year__c, Product2.Chassis_Make__c, Product2.Chassis_Model__c, Product2.Body_Model__c, Sales_Price_w_o_FET__c" +
                " FROM OpportunityLineItem" +
                " WHERE OpportunityId='" + this.opportunityId + "'"
        });
    }


    insertAdminPOs() {
        let recordsToInsert = [];

        for(let poIndex in this.poDynamicList) {
            this.recordsToInsert.push({
                'Title__c': this.view.getAttribute(this.poDynamicList[poIndex].dataIdTitle, 'value'),

                'Cost__c': this.view.getAttribute(this.poDynamicList[poIndex].dataIdCost, 'value'),

                'Description__c': this.view.getAttribute(this.poDynamicList[poIndex].dataIdDescription, 'value'),

                'AdminChecklist__c': this.adminChosen
            });
        }

        return insertRecords({
            objectName: 'AdminPO__c',

            records: recordsToInsert
        });
    }


    loadAdminFromRecord(record) {
        this.view.setAttribute('whoWhat_AdminName', 'value', record['Name__c']);
        this.view.setAttribute('whoWhat_Salesman', 'value', record['Salesman__c']);
        this.view.setAttribute('whoWhat_Customer', 'value', record['Customer_Name__c']);
        this.view.setAttribute('whoWhat_Date', 'value', record['Date__c']);
        this.view.setAttribute('whoWhat_Chassis_Year', 'value', record['Chassis_Year__c']);
        this.view.setAttribute('whoWhat_Chassis_VIN', 'value', record['Chassis_VIN__c']);
        this.view.setAttribute('whoWhat_Chassis_Make', 'value', record['Chassis_Make__c']);
        this.view.setAttribute('whoWhat_Chassis_Model', 'value', record['Chassis_Model__c']);
        this.view.setAttribute('whoWhat_Body_Series_Name', 'value', record['Body_Series_Name__c']);

        this.view.setAttribute('finances_Profit_Amount', 'value', record['Profit_Amount__c']);
        this.view.setAttribute('finances_Dealer_Pack', 'value', record['Dealer_Pack__c']);
        this.view.setAttribute('finances_FET_Checkbox', 'checked', record['ApplyFET__c']);
        this.view.setAttribute('finances_Minus_Tire_FET', 'value', record['Minus_Tire_FET__c']);
        this.view.setAttribute('finances_Extended_Warranty', 'value', record['Extended_Warranty__c']);
        this.view.setAttribute('finances_Other_Fees', 'value', record['Other_Fees__c']);
        this.view.setAttribute('finances_Documentation_Fee', 'value', record['Documentation_Fee__c']);
        this.view.setAttribute('finances_Deposit', 'value', record['Deposit__c']);
        
        this.view.setAttribute('tradeIn_Make', 'value', record['TradeIn_Make__c']);
        this.view.setAttribute('tradeIn_Year', 'value', record['TradeIn_Year__c']);
        this.view.setAttribute('tradeIn_Model', 'value', record['TradeIn_Model__c']);
        this.view.setAttribute('tradeIn_Unit_Number', 'value', record['TradeIn_Unit_Number__c']);
        this.view.setAttribute('tradeIn_Actual_Cash_Value', 'value', record['TradeIn_Actual_Cash_Value__c']);
        this.view.setAttribute('tradeIn_Billing_Amount', 'value', record['TradeIn_Billing_Amount__c']);

        this.view.setAttribute('fetCredit_FET_Front_Description', 'value', record['FET_Front_Description__c']);
        this.view.setAttribute('fetCredit_FET_Front_Size', 'value', record['FET_Front_Size__c']);
        this.view.setAttribute('fetCredit_FET_Front_Cost', 'value', record['FET_Front_Cost__c']);
        this.view.setAttribute('fetCredit_FET_Front_Quantity', 'value', record['FET_Front_Quantity__c']);
        this.view.setAttribute('fetCredit_FET_Rear_Description', 'value', record['FET_Rear_Description__c']);
        this.view.setAttribute('fetCredit_FET_Rear_Size', 'value', record['FET_Rear_Size__c']);
        this.view.setAttribute('fetCredit_FET_Rear_Cost', 'value', record['FET_Rear_Cost__c']);
        this.view.setAttribute('fetCredit_FET_Rear_Quantity', 'value', record['FET_Rear_Quantity__c']);
    }


    loadPOsFromRecords(records) {
        for(let i in records) {
            this.addToPOList(records[i].Title__c, records[i].Cost__c, records[i].Description__c);
        }
    }

    loadAdminFromOpportunity(record) {
        this.opportunityId = record['Id'];

        this.view.setAttribute('whoWhat_AdminName', 'value', record['Name']);
        this.view.setAttribute('whoWhat_AdminName', 'disabled', true);

        this.view.setAttribute('whoWhat_Salesman', 'value', record['OwnerId']);
        this.view.setAttribute('whoWhat_Salesman', 'disabled', true);

        this.view.setAttribute('whoWhat_Customer', 'value', record['Account']['Name']);
        this.view.setAttribute('whoWhat_Customer', 'disabled', true);


        this.view.setAttribute('finances_Profit_Amount', 'value', record['Gross_Amount_s__c']);
        this.view.setAttribute('finances_Profit_Amount', 'disabled', true);

        this.view.setAttribute('finances_Profit_Percent', 'disabled', true);

        this.view.setAttribute('finances_Dealer_Pack', 'value', record['Total_PAC_Fees__c']);
        this.view.setAttribute('finances_Dealer_Pack', 'disabled', true);

        this.view.setAttribute('finances_Documentation_Fee', 'value', record['Doc_Fee__c']);
        this.view.setAttribute('finances_Documentation_Fee', 'disabled', true);

        let deposit = 0;
        if(record['Deposit_Received__c']){
            deposit = record['Deposit_Received__c'];   
        }

        if(record['Total_Actual_Cash_Value__c']) {
            deposit += record['Total_Actual_Cash_Value__c'];
        }
        this.view.setAttribute('finances_Deposit', 'value', deposit);
        this.view.setAttribute('finances_Deposit', 'disabled', true);
    }

    loadAdminFromProducts(records) {
        // Find Chassis if there
        for(let i in records) {
            if(records[i].Product2.RecordType.Name === 'Chassis') {
                this.view.setAttribute('whoWhat_Chassis_Year', 'value', records[i].Product2.Year__c);
                this.view.setAttribute('whoWhat_Chassis_Year', 'disabled', true);

                this.view.setAttribute('whoWhat_Chassis_Make', 'value', records[i].Product2.Chassis_Make__c);
                this.view.setAttribute('whoWhat_Chassis_Make', 'disabled', true);

                this.view.setAttribute('whoWhat_Chassis_VIN', 'value', records[i].Product2.VIN__c);
                this.view.setAttribute('whoWhat_Chassis_VIN', 'disabled', true);

                this.view.setAttribute('whoWhat_Chassis_Model', 'value', records[i].Product2.Chassis_Model__c);
                this.view.setAttribute('whoWhat_Chassis_Model', 'disabled', true);


                // If we have the Cost for the Chassis from the Product go ahead and use that
                // and it will be the fallback for when we don't have a PO Line to find the cost with
//                this.view.setAttribute('cost_'..., 'value', records[i].Total_Product_Cost__c);
//                this.view.setAttribute('cost_'..., 'disabled', true);
//                this.view.setAttribute('remove_'..., 'hidden', true);

                break;
            }
        }


        // Find Body if there
        for(let i in records) {
            if(records[i].Product2.RecordType.Name === 'Service Body') {
                this.view.setAttribute('whoWhat_Body_Series_Name', 'value', records[i].Product2.Body_Model__c);
                this.view.setAttribute('whoWhat_Body_Series_Name', 'disabled', true);

//                this.view.setAttribute('cost_'..., 'value', records[i].Total_Product_Cost__c);
//                this.view.setAttribute('cost_'..., 'disabled', true);
//                this.view.setAttribute('remove_'..., 'hidden', true);

                break;
            }
        }

        // Find Others
    }


    loadPOsFromPOLines(records) {
        for(let i in records) {
            this.addToPOList('Descriptive Title', records[i].rstk__poline_amtreq__c, '');

            this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

            this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[i].rstk__poline_longdescr__c;
        }
    }


    handleClick_AddPO() {
        this.addToPOList(this.view.getAttribute('AddPOTitle', 'value'), this.view.getAttribute('AddPOCost', 'value'), this.view.getAttribute('AddPODescription', 'value'));

        this.setInitials_AddPO();
    }


    handleClick_RemovePO(event) {
        let poIndex = event.target.getAttribute('data-index');

        this.poDynamicList.splice(poIndex, 1);

        this.updatePODynamicIndices();
    }


    handleAdminChosen() {
        this.queryAdminChosen().then(records => {
            if(records) {
                if(records.length > 0) {
                    this.loadAdminFromRecord(records[0]);
                    let adminData = records[0];
console.log(adminData);
                    this.queryAdminPOs().then(records => {
                        if(records) {
                            if(records.length > 0) {
                                // clear out the default POs and put in the ones that exist
                                this.poDynamicList = [];

                                this.loadPOsFromRecords(records);
                                let adminPOData = records;
console.log(adminPOData);
                                
                            }
                        }


                        this.queryOpportunity().then(records => {
                            if(records) {
                                if(records.length > 0) {
                                    this.loadAdminFromOpportunity(records[0]);
                                    let opportunityData = records[0];
console.log(opportunityData);                                            
                                    this.queryProducts().then(records => {
                                        if(records) {
                                            if(records.length > 0) {
                                                this.loadAdminFromProducts(records);
                                                let productsData = records;
console.log(productsData);
                                                getPOs({ lineItems: productsData }).then(records => {
console.log(records);
                                                    if(records) {
                                                        if(records.length > 0) {
                                                            this.loadPOsFromPOLines(records);



                                                        }
                                                    }

                                                }).catch(err => {
                                                    this.toast.displayError(err.body ? err.body.message : err.message);
                                                });
                                            }
                                        }
                                    }).catch(err => {
                                        this.toast.displayError(err.body ? err.body.message : err.message);
                                    });
                                }
                            }
                        }).catch(err => {
                            this.toast.displayError(err.body ? err.body.message : err.message);
                        });
                    }).catch(err => {
                        this.toast.displayError(err.body ? err.body.message : err.message);
                    });
                }
            }
        }).catch(err => {
            this.toast.displayError(err.body ? err.body.message : err.message);
        });
    }


    handleModifyFinances() {
        this.updateFinanceCalculations();
    }
    handleModifyProfitPercent() {
        if(Number(this.view.getAttribute('finances_Profit_Percent', 'value')) > 1.0) {
            this.view.setAttribute('finances_Profit_Percent', 'value', this.view.getAttribute('finances_Profit_Percent', 'value') / 100);
        }

        this.updateFinanceCalculationsAfterPercent();
    }


    renderedCallback() {
        this.view.updateNodes( this.template.querySelectorAll("[data-track='true']") );

        this.updateFinanceCalculations();
        this.calculateFETTotals();
    }
}