
import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'
import { CurrentPageReference } from 'lightning/navigation';

import { LWC_Toast } from "c/lwc_generic_prototype";

import queryFromString from "@salesforce/apex/Apex_Generic_Prototype.queryFromString";
import insertRecords from "@salesforce/apex/Apex_Generic_Prototype.insertRecords";
import updateRecordFromId from "@salesforce/apex/Apex_Generic_Prototype.updateRecordFromId";
import updateRecords from "@salesforce/apex/Apex_Generic_Prototype.updateRecords";
import deleteRecords from "@salesforce/apex/Apex_Generic_Prototype.deleteRecords";


import { View } from "c/lwc_mvc_prototype2";

import getPOs from '@salesforce/apex/AdminChecklist_Controller.getPOs';
import insertRecord from '@salesforce/apex/AdminChecklist_Controller.insertRecord';

import downloadAdmin from '@salesforce/apex/AdminChecklist_Downloader.downloadAdmin';
//import saveSnapshot from '@salesforce/apex/AdminChecklist_Downloader.saveSnapshot';

import {blobToPDF} from 'c/lwc_blob_handler';

import { loadScript } from 'lightning/platformResourceLoader';
import AWS_SDK from '@salesforce/resourceUrl/aws_sdk';

import getAWS from '@salesforce/apex/CredentialManager.getAWS';

import { AdminS3 } from 'c/admin_s3';




export default class Admin_checklist extends NavigationMixin(LightningElement) {
    @track poDynamicList;

    // Holds Ids of POs that are to be removed, so when a save happens it officially removes them
    poBlackList;

    adminChosen;
    opportunityId;

    toast;

    view;

    @track typeOptions;

    gotURLParams;

    @wire(CurrentPageReference)
    currentPageReference;

    awsIsInitialized;
    s3;


    constructor() {
        super();

        this.typeOptions = [
            {label: 'Chassis', value: 'Chassis'},
            {label: 'Body', value: 'Body'},
            {label: 'Freight', value: 'Freight'},
            {label: 'A Order', value: 'A Order'},
            {label: 'Other', value: 'Other'}
        ];

        this.view = new View();

        this.toast = new LWC_Toast(this);

        this.poDynamicList = [];
        this.poBlackList = [];

    // -----------------------------------------------------------------------
    // This will be moved to where this is only added if an admin isn't found, etc. 
        this.addToPOList('Chassis', 0, '');
        this.addToPOList('Body', 0, '');
        this.addToPOList('Freight', 0, '');
    // -----------------------------------------------------------------------
    }


    addToPOList(type, cost, description) {
        this.poDynamicList.push({
            index: this.poDynamicList.length,

            dataIdType: 'type_' + this.poDynamicList.length,
            type: type,

            dataIdCost: 'cost_' + this.poDynamicList.length,
            cost: cost,

            dataIdDescription: 'description_' + this.poDynamicList.length,
            description: description,

            dataIdRemoveButton: 'remove_' + this.poDynamicList.length,

            disabled: false,

            lineDescription: ''
        });
    }

    addToFrontOfPOList(type, cost, description) {
        this.poDynamicList.unshift({
            index: this.poDynamicList.length,

            dataIdType: 'type_' + this.poDynamicList.length,
            type: type,

            dataIdCost: 'cost_' + this.poDynamicList.length,
            cost: cost,

            dataIdDescription: 'description_' + this.poDynamicList.length,
            description: description,

            dataIdRemoveButton: 'remove_' + this.poDynamicList.length,

            disabled: false,

            lineDescription: ''
        });


        this.updatePODynamicIndices();
    }

    updatePODynamicIndices() {
        for(let i = 0; i < this.poDynamicList.length; i++) {
            this.poDynamicList[i].index = i;

            this.poDynamicList[i].dataIdType = 'type_' + i;

            this.poDynamicList[i].dataIdCost = 'cost_' + i;

            this.poDynamicList[i].dataIdDescription = 'description_' + i;

            this.poDynamicList[i].dataIdRemoveButton = 'remove_' + i;
        }
    }

    removeFromPOList(poIndex) {
        // If this Admin PO was pulled then his Id would have been passed to apiId. So blacklist him only if he was pulled.
        if(this.poDynamicList[poIndex].apiId) {
            this.poBlackList.push(this.poDynamicList[poIndex].apiId);
        }

        this.poDynamicList.splice(poIndex, 1);

        this.updatePODynamicIndices();
    }

    // As this is currently set up I am only matching on the first occurence, so keep that in mind if it ends up needing
    // changed later on
    findCorrespondingPO(type, cost) {
        for(let i in this.poDynamicList) {
            if(this.poDynamicList[i].type === type && Math.abs(this.poDynamicList[i].cost - cost) < 0.01) {
                return i;
            }
        }

        return -1;
    }


    setInitials_AddPO() {
        this.view.setAttribute('AddPOType', 'value', '');
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

        if(sum) {
            this.view.setAttribute('finances_Profit_Percent', 'value', sum.toFixed(4));
        }else {
            this.view.setAttribute('finances_Profit_Percent', 'value', 0);
        }
    }
    calculateProfitAmount() {
        let sum = Number(this.view.getAttribute('finances_POSubtotal', 'value')) * Number(this.view.getAttribute('finances_Profit_Percent', 'value'));

        this.view.setAttribute('finances_Profit_Amount', 'value', sum);
    }


    calculateGrossesAfterCommision() {
        let sum = Number(this.view.getAttribute('finances_Profit_Amount', 'value'));
        sum -= Number(this.view.getAttribute('finances_Dealer_Pack', 'value'));

        this.view.setAttribute('finances_Gross_Amount', 'value', sum);

        sum = sum / ( Number(this.view.getAttribute('finances_POSubtotal', 'value')) + Number(this.view.getAttribute('finances_Profit_Amount', 'value')) );

        if(sum) {
            this.view.setAttribute('finances_Gross_Percent', 'value', sum);
        }else {
            this.view.setAttribute('finances_Gross_Percent', 'value', 0);
        }
        
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


    queryAdminChosen() {
        return queryFromString({
            queryString:
                "SELECT Name__c, Salesman__c, Customer_Name__c, Chassis_Year__c, Chassis_Make__c, Chassis_VIN__c, Chassis_Model__c, Date__c, Body_Series_Name__c, ManagerName__c, DateOfApproval__c, Notes__c, Profit_Amount__c, Dealer_Pack__c, ApplyFET__c, Minus_Tire_FET__c, Extended_Warranty__c, Other_Fees__c, Documentation_Fee__c, Deposit__c, TradeIn_Make__c, TradeIn_Year__c, TradeIn_Model__c, TradeIn_Unit_Number__c, TradeIn_Actual_Cash_Value__c, TradeIn_Billing_Amount__c, TradeIn_Payoff__c, FET_Front_Description__c, FET_Front_Size__c, FET_Front_Cost__c, FET_Front_Quantity__c, FET_Rear_Description__c, FET_Rear_Size__c, FET_Rear_Cost__c, FET_Rear_Quantity__c" +
                " FROM AdminChecklist__c" +
                " WHERE Id='" + this.adminChosen + "'"
        });
    }

    queryAdminPOs() {
        return queryFromString({
            queryString:
                "SELECT Id, Type__c, Cost__c, Description__c" +
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
                "SELECT Product2.Name, Product2.VIN__c, Product2.VIN_Last_6__c, Product2.RecordType.Name, Product2.Year__c, Product2.Chassis_Year__c, Product2.Chassis_Make__c, Product2.Chassis_Model__c, Product2.Body_Model__c, Sales_Price_w_o_FET__c, Product2.Trade_Allowance__c, Product2.Pay_Off_Amount__c, Total_Product_Cost__c" +
                " FROM OpportunityLineItem" +
                " WHERE OpportunityId='" + this.opportunityId + "'"
        });
    }


    insertAdminPOs() {
        let recordsToInsert = [];

        for(let poIndex in this.poDynamicList) {
            this.recordsToInsert.push({
                'Type__c': this.view.getAttribute(this.poDynamicList[poIndex].dataIdType, 'value'),

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
console.log(record);
        this.view.setAttribute('ManagerName', 'value', record['ManagerName__c']);
        this.view.setAttribute('DateOfApproval', 'value', record['DateOfApproval__c']);

        this.view.setAttribute('Notes', 'value', record['Notes__c']);

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
        this.view.setAttribute('tradeIn_Payoff', 'value', record['TradeIn_Payoff__c']);

        this.view.setAttribute('fetCredit_FET_Front_Description', 'value', record['FET_Front_Description__c']);
        this.view.setAttribute('fetCredit_FET_Front_Size', 'value', record['FET_Front_Size__c']);
        this.view.setAttribute('fetCredit_FET_Front_Cost', 'value', record['FET_Front_Cost__c']);
        this.view.setAttribute('fetCredit_FET_Front_Quantity', 'value', record['FET_Front_Quantity__c']);
        this.view.setAttribute('fetCredit_FET_Rear_Description', 'value', record['FET_Rear_Description__c']);
        this.view.setAttribute('fetCredit_FET_Rear_Size', 'value', record['FET_Rear_Size__c']);
        this.view.setAttribute('fetCredit_FET_Rear_Cost', 'value', record['FET_Rear_Cost__c']);
        this.view.setAttribute('fetCredit_FET_Rear_Quantity', 'value', record['FET_Rear_Quantity__c']);
    }


    loadAdminPOsFromRecords(records) {
        // Used to hold index when checking if a matching one already exists or not
        let correspondant;

        for(let i in records) {
            correspondant = this.findCorrespondingPO(records[i].Type__c, records[i].Cost__c);

            if(correspondant < 0) {
                this.addToPOList(records[i].Type__c, records[i].Cost__c, records[i].Description__c);

                this.poDynamicList[this.poDynamicList.length - 1].apiId = records[i].Id;
            }else {
                // If I find a matching PO already Existing then I need to put the Description from this and update this
                // AdminPO when saved

                this.poDynamicList[correspondant].description = records[i].Description__c;

                this.poDynamicList[correspondant].apiId = records[i].Id;
            }
        }
    }


    loadAdminFromOpportunity(record) {
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


                // If there isn't a Chassis PODynamic yet then put it in at the front
                let correspondant = this.findCorrespondingPO('Chassis', records[i].Total_Product_Cost__c);

                if(correspondant < 0) {
                    this.addToFrontOfPOList('Chassis', records[i].Total_Product_Cost__c, '');

                    this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                    this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = 'From Opportunity Product';
                }else {
                    this.poDynamicList[correspondant]['disabled'] = true;

                    this.poDynamicList[correspondant]['lineDescription'] = 'From Opportunity Product';
                }

                break;
            }
        }


        // Find Body if there
        for(let i in records) {
            if(records[i].Product2.RecordType.Name === 'Service Body') {
                this.view.setAttribute('whoWhat_Body_Series_Name', 'value', records[i].Product2.Body_Model__c);
                this.view.setAttribute('whoWhat_Body_Series_Name', 'disabled', true);

                break;

//                this.view.setAttribute('cost_'..., 'value', records[i].Total_Product_Cost__c);
//                this.view.setAttribute('cost_'..., 'disabled', true);
//                this.view.setAttribute('remove_'..., 'hidden', true);

                break;
            }
        }


        // Find Lube if there
        for(let i in records) {
            if(records[i].Product2.RecordType.Name === 'Lube') {
                // Make sure it is a lube body and not a lube skid
                if(!records[i].Product2.Name.includes('LS')) {
                    this.view.setAttribute('whoWhat_Body_Series_Name', 'value', records[i].Product2.Body_Model__c);
                    this.view.setAttribute('whoWhat_Body_Series_Name', 'disabled', true);
                }

                break;

//                this.view.setAttribute('cost_'..., 'value', records[i].Total_Product_Cost__c);
//                this.view.setAttribute('cost_'..., 'disabled', true);
//                this.view.setAttribute('remove_'..., 'hidden', true);

                break;
            }
        }


        // Find Used Unit if there
        for(let i in records) {
            if(records[i].Product2.RecordType.Name === 'Used Unit') {
                this.view.setAttribute('tradeIn_Make', 'value', records[i].Product2.Chassis_Make__c);
                this.view.setAttribute('tradeIn_Make', 'disabled', true);

                this.view.setAttribute('tradeIn_Year', 'value', records[i].Product2.Chassis_Year__c);
                this.view.setAttribute('tradeIn_Year', 'disabled', true);

                this.view.setAttribute('tradeIn_Model', 'value', records[i].Product2.Chassis_Model__c);
                this.view.setAttribute('tradeIn_Model', 'disabled', true);

                this.view.setAttribute('tradeIn_Unit_Number', 'value', records[i].Product2.VIN__c);
                this.view.setAttribute('tradeIn_Unit_Number', 'disabled', true);


                if(records[i].Product2.Trade_Allowance__c) {
                    this.view.setAttribute('tradeIn_Actual_Cash_Value', 'value', records[i].Product2.Trade_Allowance__c);
                }else {
                    this.view.setAttribute('tradeIn_Actual_Cash_Value', 'value', 0);
                }
                this.view.setAttribute('tradeIn_Actual_Cash_Value', 'disabled', true);

                if(records[i].Total_Product_Cost__c) {
                    this.view.setAttribute('tradeIn_Billing_Amount', 'value', records[i].Total_Product_Cost__c);
                }else {
                    this.view.setAttribute('tradeIn_Billing_Amount', 'value', 0);
                }
                this.view.setAttribute('tradeIn_Billing_Amount', 'disabled', true);

                if(records[i].Product2.Pay_Off_Amount__c) {
                    this.view.setAttribute('tradeIn_Payoff', 'value', records[i].Product2.Pay_Off_Amount__c);
                }else {
                    this.view.setAttribute('tradeIn_Payoff', 'value', 0);
                }
                this.view.setAttribute('tradeIn_Payoff', 'disabled', true);

                break;
            }
        }


        // Find Others
        // . . .
    }


    loadPOsFromPOLines(poMap) {
        // Used to hold index of AdminPOs match if already put there by AdminPOs
        let correspondant;

        // First put the Chassis if there is one
        if(poMap['Chassis']) {
            // Make sure list isn't empty, it has been before
            if(poMap['Chassis'].length > 0) {
                // First see if Chassis is already Present from AdminPOs, if so then just disable the cost and remove, otherwise
                // go ahead an add the Chassis PO
                // Used to hold index when checking if a matching one already exists or not
                let record = poMap['Chassis'][0];

                correspondant = this.findCorrespondingPO('Chassis', record.rstk__poline_amtreq__c);

                if(correspondant < 0) {
                    this.addToFrontOfPOList('Chassis', record.rstk__poline_amtreq__c, '');

                    this.poDynamicList[0]['disabled'] = true;

                    this.poDynamicList[0]['lineDescription'] = record.rstk__poline_longdescr__c;
                }else {
                    // If we do find a match from AdminPO already there, then go ahead and disable that field
                    this.poDynamicList[correspondant]['disabled'] = true;

                    this.poDynamicList[correspondant]['lineDescription'] = record.rstk__poline_longdescr__c;
                }
            }
        }

        // Then put the Body and its associated POs
        if(poMap['Service Body']) {
            // Make sure list isn't empty, it has been before
            if(poMap['Service Body'].length > 0) {
                let records = poMap['Service Body'];

                // In order to determine which one is the body I have to find the highest priced PO
                // This is the nature of Rootstock
                let maxIndex = 0;

                // Holds the Indices of the aorders, freights, etc. within record
                let aOrders = [];
                let freights = [];

                // Holds the indeices of what wasn't caught by the above within record
                let others = [];


                // Find the Body, and find the Aorders and the Freights
                for(let i in records) {
                    if(records[i].rstk__poline_longdescr__c.toLowerCase().includes('freight')) {
                        freights.push(i);
                    }else if(records[i].rstk__poline_longdescr__c.toLowerCase().includes('a order')) {
                        aOrders.push(i);
                    }else {
                        others.push(i);
                    }

                    if(records[i].rstk__poline_amtreq__c > records[maxIndex].rstk__poline_amtreq__c) {
                        maxIndex = i;
                    }
                }

                // remove Body from Others, which is Max Index
                let bodyOther = others.findIndex(element => Number(element) === Number(maxIndex));

                if(bodyOther >= 0) {
                    others.splice(bodyOther, 1);
                }

                // Do the Body
                correspondant = this.findCorrespondingPO('Body', records[maxIndex].rstk__poline_amtreq__c);
                
                if(correspondant < 0) {
                    this.addToPOList('Body', records[maxIndex].rstk__poline_amtreq__c, '');

                    this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                    this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[maxIndex].rstk__poline_longdescr__c;
                }else {
                    this.poDynamicList[correspondant]['disabled'] = true;

                    this.poDynamicList[correspondant]['lineDescription'] = records[maxIndex].rstk__poline_longdescr__c;
                }


                // Then Do The A Orders
                for(let i in aOrders) {
                    correspondant = this.findCorrespondingPO('A Order', records[aOrders[i]].rstk__poline_amtreq__c);
               
                    if(correspondant < 0) {
                        this.addToPOList('A Order', records[aOrders[i]].rstk__poline_amtreq__c, '');

                        this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                        this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[aOrders[i]].rstk__poline_longdescr__c;
                    }else {
                        this.poDynamicList[correspondant]['disabled'] = true;

                        this.poDynamicList[correspondant]['lineDescription'] = records[aOrders[i]].rstk__poline_longdescr__c;
                    }
                }


                // Then the Freights
                for(let i in freights) {
                    correspondant = this.findCorrespondingPO('Freight', records[freights[i]].rstk__poline_amtreq__c);
                
                    if(correspondant < 0) {
                        this.addToPOList('Freight', records[freights[i]].rstk__poline_amtreq__c, '');

                        this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                        this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[freights[i]].rstk__poline_longdescr__c;
                    }else {
                        this.poDynamicList[correspondant]['disabled'] = true;

                        this.poDynamicList[correspondant]['lineDescription'] = records[freights[i]].rstk__poline_longdescr__c;
                    }
                }


                // Then the Others
                for(let i in others) {
                    correspondant = this.findCorrespondingPO('Other', records[others[i]].rstk__poline_amtreq__c);
                
                    if(correspondant < 0) {
                        this.addToPOList('Other', records[others[i]].rstk__poline_amtreq__c, '');

                        this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                        this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[others[i]].rstk__poline_longdescr__c;
                    }else {
                        this.poDynamicList[correspondant]['disabled'] = true;

                        this.poDynamicList[correspondant]['lineDescription'] = records[others[i]].rstk__poline_longdescr__c;
                    }
                }
            }
        }


        // Then put the Body and its associated POs
        if(poMap['Lube']) {
            // Make sure list isn't empty, it has been before
            if(poMap['Lube'].length > 0) {
                let records = poMap['Lube'];

                // In order to determine which one is the body I have to find the highest priced PO
                // This is the nature of Rootstock
                let maxIndex = 0;

                // Holds the Indices of the aorders, freights, etc. within record
                let aOrders = [];
                let freights = [];

                // Holds the indeices of what wasn't caught by the above within record
                let others = [];


                // Find the Body, and find the Aorders and the Freights
                for(let i in records) {
                    if(records[i].rstk__poline_longdescr__c.toLowerCase().includes('freight')) {
                        freights.push(i);
                    }else if(records[i].rstk__poline_longdescr__c.toLowerCase().includes('a order')) {
                        aOrders.push(i);
                    }else {
                        others.push(i);
                    }

                    if(records[i].rstk__poline_amtreq__c > records[maxIndex].rstk__poline_amtreq__c) {
                        maxIndex = i;
                    }
                }

                // We don't want to mix a lube skid for a body
                if(!records[maxIndex].rstk__poline_longdescr__c.toUpperCase().includes('LUBE SKID')) {
                    // TODO: Surround this with If there is a Lube Body then do this, otherwise don't
                    // We don't want to put a Lube Skid as a Body     
                    // remove Body from Others, which is Max Index
                    let bodyOther = others.findIndex(element => Number(element) === Number(maxIndex));

                    if(bodyOther >= 0) {
                        others.splice(bodyOther, 1);
                    }

                    // Do the Body
                    correspondant = this.findCorrespondingPO('Body', records[maxIndex].rstk__poline_amtreq__c);
                    
                    if(correspondant < 0) {
                        this.addToPOList('Body', records[maxIndex].rstk__poline_amtreq__c, '');

                        this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                        this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[maxIndex].rstk__poline_longdescr__c;
                    }else {
                        this.poDynamicList[correspondant]['disabled'] = true;

                        this.poDynamicList[correspondant]['lineDescription'] = records[maxIndex].rstk__poline_longdescr__c;
                    }
                }


                // Then Do The A Orders
                for(let i in aOrders) {
                    correspondant = this.findCorrespondingPO('A Order', records[aOrders[i]].rstk__poline_amtreq__c);
               
                    if(correspondant < 0) {
                        this.addToPOList('A Order', records[aOrders[i]].rstk__poline_amtreq__c, '');

                        this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                        this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[aOrders[i]].rstk__poline_longdescr__c;
                    }else {
                        this.poDynamicList[correspondant]['disabled'] = true;

                        this.poDynamicList[correspondant]['lineDescription'] = records[aOrders[i]].rstk__poline_longdescr__c;
                    }
                }


                // Then the Freights
                for(let i in freights) {
                    correspondant = this.findCorrespondingPO('Freight', records[freights[i]].rstk__poline_amtreq__c);
                
                    if(correspondant < 0) {
                        this.addToPOList('Freight', records[freights[i]].rstk__poline_amtreq__c, '');

                        this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                        this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[freights[i]].rstk__poline_longdescr__c;
                    }else {
                        this.poDynamicList[correspondant]['disabled'] = true;

                        this.poDynamicList[correspondant]['lineDescription'] = records[freights[i]].rstk__poline_longdescr__c;
                    }
                }


                // Then the Others
                for(let i in others) {
                    correspondant = this.findCorrespondingPO('Other', records[others[i]].rstk__poline_amtreq__c);
                
                    if(correspondant < 0) {
                        this.addToPOList('Other', records[others[i]].rstk__poline_amtreq__c, '');

                        this.poDynamicList[this.poDynamicList.length - 1]['disabled'] = true;

                        this.poDynamicList[this.poDynamicList.length - 1]['lineDescription'] = records[others[i]].rstk__poline_longdescr__c;
                    }else {
                        this.poDynamicList[correspondant]['disabled'] = true;

                        this.poDynamicList[correspondant]['lineDescription'] = records[others[i]].rstk__poline_longdescr__c;
                    }
                }
            }
        }
    }



    handleClick_AddPO() {
        this.addToPOList(this.view.getAttribute('AddPOType', 'value'), this.view.getAttribute('AddPOCost', 'value'), this.view.getAttribute('AddPODescription', 'value'));

        this.setInitials_AddPO();
    }


    handleClick_RemovePO(event) {
        this.removeFromPOList(event.target.getAttribute('data-index'));
    }



    initializeAWS(accessKeyId, secretAccessKey) {
        loadScript(this, AWS_SDK).then(() => {
            AWS.config.update({
                accessKeyId: accessKeyId,

                secretAccessKey: secretAccessKey,

                region: 'us-east-2'
            });

            let awsS3 = new AWS.S3({
                apiVersion: '2006-03-01'
            });

            this.s3 = new AdminS3(awsS3);
        }).catch(err => {
            console.log(err.body ? err.body.message : err.message);
        });
    }



    handleAdminSelected(event) {
        if(event) {
            if(event.detail.value) {
                this.adminChosen = event.detail.value;
            }
        }

        try {
            let newPageReference = Object.assign({}, this.currentPageReference, {
                state: Object.assign({}, this.currentPageReference.state, {c__AdminChosen: this.adminChosen})
            });

            event.preventDefault();
            event.stopPropagation();

            this[NavigationMixin.Navigate](newPageReference, true);
        }catch(err) {
            console.error(err.body ? err.body.message : err.message);
        }

        this.handleAdminChosen();
    }


    handleAdminChosen() {
        // Needed because of asynchronous timing when adminchosen is set the Snapshots are not updated reactively, so manually do it here 
        try {
            if(this.view.getElementToCall("Snapshots")) {
                this.view.getElementToCall("Snapshots").updateAdminId(this.adminChosen);
            }
        } catch(err) {
            console.error(err.message);
        }

        this.poDynamicList = [];


        if(!this.awsIsInitialized) {
            this.awsIsInitialized = true;

            getAWS().then(credentials => {
                if(credentials['accessKeyId'] && credentials['secretAccessKey']) {
                    this.initializeAWS(credentials['accessKeyId'], credentials['secretAccessKey']);   
                }else {
                    this.toast.displayError('Problem with AWS Access Keys');
                }
            }).catch(err => {
                this.toast.displayError(err.body ? err.body.message : err.message);
            });
        }


        this.queryAdminChosen().then(records => {
            if(records) {
                if(records.length > 0) {
                    this.loadAdminFromRecord(records[0]);


                    this.queryOpportunity().then(records => {
                        if(records) {
                            if(records.length > 0) {
                                this.loadAdminFromOpportunity(records[0]);
                                this.opportunityId = records[0].Id;
                                let opportunityName = records[0].Name; 

                                this[NavigationMixin.GenerateUrl]({
                                    type: 'standard__recordPage',
                                    attributes: {
                                        recordId: this.opportunityId,
                                        actionName: 'view'
                                    }
                                }).then(url => {
                                    url = window.location.host + url;

                                    this.view.setAttribute('whoWhat_OpportunityLink', 'label', opportunityName);
                                    this.view.setAttribute('whoWhat_OpportunityLink', 'value', url);
                                }).catch(err => {
                                    console.log(err.body ? err.body.message : err.message);
                                });

                                
                                this.queryProducts().then(records => {
                                    if(records) {
                                        if(records.length > 0) {
                                            let productsData = records;

                                            this.loadAdminFromProducts(productsData);
                                            

                                            getPOs({ lineItems: productsData }).then(poMap => {
                                                if(poMap) {
                                                    if(Object.keys(poMap).length > 0) {
                                                        this.loadPOsFromPOLines(poMap);
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


                    this.queryAdminPOs().then(records => {
                        if(records) {
                            if(records.length > 0) {
                                this.loadAdminPOsFromRecords(records);
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


    handleModifyFinances() {
        this.updateFinanceCalculations();
    }
    handleModifyProfitPercent() {
        if(Number(this.view.getAttribute('finances_Profit_Percent', 'value')) > 1.0) {
            this.view.setAttribute('finances_Profit_Percent', 'value', this.view.getAttribute('finances_Profit_Percent', 'value') / 100);
        }

        this.updateFinanceCalculationsAfterPercent();
    }



    getAdminDataFromElements() {
        let adminElements = this.template.querySelectorAll("[data-admin='true']");

        let adminData = {};

        try {
            adminElements.forEach(element => {
                if(element['dataset']['apiname'] === 'ApplyFET__c') {
                    adminData[element['dataset']['apiname']] = element['checked'];
                }else {
                    if(element['value']) {
                        // Must Check if I have a number because apex won't insert/update if string is passed
                        if(element['dataset']['isnumber']) {
                            adminData[element['dataset']['apiname']] = Number(element['value']);
                        }else {
                            adminData[element['dataset']['apiname']] = element['value'];
                        }
                    }
                }
            });
        }catch(err) {
            console.log(err.message);
        }

        return adminData;
    }

    getAdminPOsFromElements() {
        let adminPOElements = this.template.querySelectorAll("[data-adminpo='true']");

        let adminPOData = {
            toInsert: [],

            toUpdate: []
        };

        let type, cost, description;

        try {
            // Each AdminPO has 3 DOM Elements, namely 1. Type Picklist, 2. Cost textbox, 3. Description textarea
            for(let i = 0; i < adminPOElements.length/3; i++) {
                type = adminPOElements[3*i];
                cost = adminPOElements[3*i + 1];
                description = adminPOElements[3*i + 2];

                // Turns out that this gave back a string 'undefined' rather than an actual undefined or '', took a while to
                // figure out so make sure to check for that
                if(type['dataset']['apiid'] && type['dataset']['apiid'] !== 'undefined') {
                    adminPOData.toUpdate.push({});

                    adminPOData.toUpdate[adminPOData.toUpdate.length - 1]['Id'] = type['dataset']['apiid'];

                    // Effectively adminPOData[i]['Cost__c'] = 250.00, etc. for each field for each AdminPO
                    adminPOData.toUpdate[adminPOData.toUpdate.length - 1][type['dataset']['apiname']] = type['value'];
                    adminPOData.toUpdate[adminPOData.toUpdate.length - 1][cost['dataset']['apiname']] = Number(cost['value']);
                    adminPOData.toUpdate[adminPOData.toUpdate.length - 1][description['dataset']['apiname']] = description['value'];
                    adminPOData.toUpdate[adminPOData.toUpdate.length - 1]['AdminChecklist__c'] = this.adminChosen;
                }else {
                    adminPOData.toInsert.push({});

                    // Effectively adminPOData[i]['Cost__c'] = 250.00, etc. for each field for each AdminPO
                    adminPOData.toInsert[adminPOData.toInsert.length - 1][type['dataset']['apiname']] = type['value'];
                    adminPOData.toInsert[adminPOData.toInsert.length - 1][cost['dataset']['apiname']] = Number(cost['value']);
                    adminPOData.toInsert[adminPOData.toInsert.length - 1][description['dataset']['apiname']] = description['value'];
                    adminPOData.toInsert[adminPOData.toInsert.length - 1]['AdminChecklist__c'] = this.adminChosen;
                }
            }

        }catch(err) {
            console.log(err.message);
        }

        return adminPOData;
    }


    handleClick_SaveQuote() {
        try {
            let adminData = this.getAdminDataFromElements();
            
            if(this.adminChosen) {
                updateRecordFromId({ objectName: 'AdminChecklist__c', recordId: this.adminChosen, fieldValuePairs: adminData }).then(isSuccess => {
                    if(isSuccess) {
                        this.toast.displaySuccess('AdminChecklist Updated Succesfully!');
                    }else {
                        this.toast.displayError('AdminChecklist Failed to Update');
                    }
                }).catch( err => {
                    this.toast.displayError(err.body ? err.body.message : err.message);
                });


                if(adminPOData.toUpdate.length > 0) {
                    updateRecords({ objectName: 'AdminPO__c', records: adminPOData.toUpdate }).then(isSuccess => {
                        if(isSuccess) {
                            this.toast.displaySuccess('AdminPOs Updated Succesfully!');
                        }else {
                            this.toast.displayError('AdminPOs Failed to Update');
                        }
                    }).catch( err => {
                        this.toast.displayError(err.body ? err.body.message : err.message);
                    });
                }


                if(adminPOData.toInsert.length > 0) {
                    insertRecords({ objectName: 'AdminPO__c', records: adminPOData.toInsert }).then(isSuccess => {
                        if(isSuccess) {
                            this.toast.displaySuccess('AdminPOs Inserted Succesfully!');
                        }else {
                            this.toast.displayError('AdminPOs Failed to Insert');
                        }
                    }).catch( err => {
                        this.toast.displayError(err.body ? err.body.message : err.message);
                    });
                }
                
                
                // Remove the BlackListed Admin POs
                if(this.poBlackList.length > 0) {
                    deleteRecords( { objectName: 'AdminPO__c', toDelete: this.poBlackList } ).then(isSuccess => {
                        if(isSuccess) {
                            this.toast.displaySuccess('Succesfully Deleted the AdminPOs');
                        }else {
                            this.toast.displayError('Failed to Delete the Removed AdminPOs, something went wrong!');
                        }
                    }).catch(err => {
                        console.error(err.body ? err.body.message : err.message);
                    });
                }
            }else {
                insertRecord({ objectName: 'AdminChecklist__c', fieldValuePairs: adminData }).then(adminId => {
                    if(adminId) {
                        this.toast.displaySuccess('AdminChecklist Inserted Succesfully!');

                        this.adminChosen = adminId;

                        // Note that this must come after the AdminChosen has been set once inserted by the outer
                        // function, if you try to put this before, then these Admin POs will not have an Admin they
                        // are tied to
                        let adminPOData = this.getAdminPOsFromElements();

                        insertRecords({ objectName: 'AdminPO__c', records: adminPOData.toInsert }).then(isSuccess => {
                            if(isSuccess) {
                                this.toast.displaySuccess('AdminPOs Inserted Succesfully!');
                            }else {
                                this.toast.displayError('AdminPOs Failed to Insert');
                            }
                        }).catch(err => {
                            this.toast.displayError(err.body ? err.body.message : err.message);
                        });
                    }else {
                        this.toast.displayError('AdminChecklist Failed to Insert');
                    }
                }).catch( err => {
                    this.toast.displayError(err.body ? err.body.message : err.message);
                });
            }
        }catch(err) {
            console.error(err.body ? err.body.message : err.message);
        }
    }

    handleClick_PrintQuote() {
        this.handleClick_SaveQuote();

        let adminData = this.getAdminDataFromElements();
        let adminPOData = this.getAdminPOsFromElements();

        let bothPOs = adminPOData.toInsert.concat(adminPOData.toUpdate);

        let pdfParameters = adminData;

        pdfParameters.poCount = bothPOs.length;

        for(let i = 0; i < bothPOs.length; i++) {
            pdfParameters['type_' + i] = bothPOs[i]['Type__c'];
            pdfParameters['cost_' + i] = bothPOs[i]['Cost__c'];

            if(!bothPOs[i]['Description__c']) {
                bothPOs[i]['Description__c'] = "";
            }
            pdfParameters['description_' + i] = bothPOs[i]['Description__c'];
        }


        pdfParameters['profit_percent'] = this.view.getAttribute('finances_Profit_Percent', 'value');

        pdfParameters['gross_amount'] = this.view.getAttribute('finances_Gross_Amount', 'value');
        pdfParameters['gross_percent'] = this.view.getAttribute('finances_Gross_Percent', 'value');

        pdfParameters['subtotal_after_profit'] = this.view.getAttribute('finances_Subtotal_After_Profit', 'value');

        pdfParameters['12_fet'] = this.view.getAttribute('finances_12_FET', 'value');
        pdfParameters['total_fet'] = this.view.getAttribute('finances_Total_FET', 'value');

        pdfParameters['total'] = this.view.getAttribute('finances_Total', 'value');

        
        downloadAdmin({ fieldValuePairs: pdfParameters }).then(content => {
            let byteContent = atob(content);
            let buf = new Array(byteContent.length);

            for(var i = 0; i != byteContent.length; i++) {
                buf[i] = byteContent.charCodeAt(i);
            }

            const viewBuf = new Uint8Array(buf);

            let b = new Blob([viewBuf], {type: 'application/pdf'});

            console.log(b);

            let fileName = '';
            if(this.view.getAttribute('whoWhat_AdminName', 'value') && this.view.getAttribute('whoWhat_AdminName', 'value') != '') {
                fileName += 'Admin_' + this.view.getAttribute('whoWhat_AdminName', 'value');
            }else {
                fileName += 'Admin_' + this.view.getAttribute('whoWhat_Body_Series_Name', 'value');
            }

            blobToPDF(b, fileName + '.pdf');
        }).catch(err => {
            console.error(err);
            this.toast.displayError(err.body ? err.body.message : err.message);
        });
    }


    handleClick_Snapshot() {
        this.handleClick_SaveQuote();


        let adminData = this.getAdminDataFromElements();
        let adminPOData = this.getAdminPOsFromElements();

        let bothPOs = adminPOData.toInsert.concat(adminPOData.toUpdate);

        let pdfParameters = adminData;

        pdfParameters.poCount = bothPOs.length;

        for(let i = 0; i < bothPOs.length; i++) {
            pdfParameters['type_' + i] = bothPOs[i]['Type__c'];
            pdfParameters['cost_' + i] = bothPOs[i]['Cost__c'];

            if(!bothPOs[i]['Description__c']) {
                bothPOs[i]['Description__c'] = "";
            }
            pdfParameters['description_' + i] = bothPOs[i]['Description__c'];
        }


        pdfParameters['profit_percent'] = this.view.getAttribute('finances_Profit_Percent', 'value');

        pdfParameters['gross_amount'] = this.view.getAttribute('finances_Gross_Amount', 'value');
        pdfParameters['gross_percent'] = this.view.getAttribute('finances_Gross_Percent', 'value');

        pdfParameters['subtotal_after_profit'] = this.view.getAttribute('finances_Subtotal_After_Profit', 'value');

        pdfParameters['12_fet'] = this.view.getAttribute('finances_12_FET', 'value');
        pdfParameters['total_fet'] = this.view.getAttribute('finances_Total_FET', 'value');

        pdfParameters['total'] = this.view.getAttribute('finances_Total', 'value');


        downloadAdmin({ fieldValuePairs: pdfParameters }).then(content => {
            let byteContent = atob(content);
            let buf = new Array(byteContent.length);

            for(var i = 0; i != byteContent.length; i++) {
                buf[i] = byteContent.charCodeAt(i);
            }

            const viewBuf = new Uint8Array(buf);

            let blubber = new Blob([viewBuf], {type: 'application/pdf'});


            if(this.s3.isActive()) {
                let salesmanKey = this.view.getAttribute('whoWhat_Salesman', 'value');
    
                if(salesmanKey) {
                    salesmanKey += '/';
    
    
                    let adminKey = this.adminChosen;
    
                    if(adminKey) {
                        adminKey = salesmanKey + adminKey +  '/';
    
                        let snapshotMap = {
                            AdminChecklist__c: this.adminChosen,

                            Salesman__c: this.view.getAttribute('whoWhat_Salesman', 'value')
                        };
                        insertRecord({ objectName: 'AdminSnapshot__c', fieldValuePairs: snapshotMap }).then(snapshotId => {
                            let snapshotKey = snapshotId;

                            if(snapshotKey) {
                                snapshotKey = adminKey + snapshotKey + '.pdf';

                                this.s3.putSnapshot(snapshotKey, blubber).then(result => {
                                    if(result) {
                                        // Needed because of asynchronous timing when adminchosen is set the Snapshots are not updated reactively, so manually do it here 
                                        try {
                                            if(this.view.getElementToCall("Snapshots")) {
                                                this.view.getElementToCall("Snapshots").updateAdminId(this.adminChosen);
                                            }
                                        } catch(err) {
                                            console.error(err.message);
                                        }

                                        this.toast.displaySuccess('Snapshot Saved Successfully!');
                                    }else {
                                        this.toast.displayWarning('Snapshot failed to Save, no error was given.');
                                    }
                                }).catch(err => {
                                    console.log(err.body ? err.body.message : err.message);
                                });
                            }
                        }).catch(err => {
                            console.error(err.body ? err.body.message : err.message);

                            this.toast.displayError('Something went wrong during or after generating the Record for the Snapshot Object');
                        });   
                    }else {
                        this.toast.displayError('Admin is Unknown: Either this is a brand new Admin that hasn\'t been saved for the first time yet, or something else went wrong');
                    }
                }else {
                    this.toast.displayError('Must select a Salesman before you can take a Snapshot');
                }
            }

            // OLD will be removed when I am certain that I don't need it anymore
            /*
            saveSnapshot({ name: 'TESTNAME', fieldValuePairs:  }).then(isSuccess => {
                if(isSuccess) {
                    this.toast.displaySuccess('Snapshot saved succesfully');
                }else {
                    this.toast.displayError('Failed to save Snapshot, something went wrong');
                }
            }).catch(err => {
                this.toast.displayError(err.body ? err.body.message : err.message);
            });
            */


            //blobToPDF(b, fileName + '.pdf');
        }).catch(err => {
            console.error(err);
            this.toast.displayError(err.body ? err.body.message : err.message);
        });
        /*
        // QUICK TESTING OF S3 THEN I WILL MOVE THIS TO THE APPROPIATE PLACE ABOVE
        if(this.s3.isActive()) {
            let salesmanKey = this.view.getAttribute('whoWhat_Salesman', 'value');

            if(salesmanKey) {
                salesmanKey += '/';


                let adminKey = this.adminChosen;

                if(adminKey) {
                    adminKey = salesmanKey + adminKey +  '/';

                    this.s3.addFolder(adminKey).then(result => {
                        if(result) {
                            this.toast.displaySuccess('Snapshot Saved Successfully!');
                        }else {
                            this.toast.displayWarning('Snapshot failed to Save, no error was given.');
                        }
                    }).catch(err => {
                        console.log(err.body ? err.body.message : err.message);
                    });   
                }else {
                    this.toast.displayError('Admin is Unknown: Either this is a brand new Admin that hasn\'t been saved for the first time yet, or something else went wrong');
                }
            }else {
                this.toast.displayError('Must select a Salesman before you can take a Snapshot');
            }
        }
        */
    }


    renderedCallback() {
        this.view.updateNodes( this.template.querySelectorAll("[data-track='true']") );

        this.updateFinanceCalculations();
        this.calculateFETTotals();

        if(!this.gotURLParams) {
            // regardless of whether it has params or not, this needs to run within rendered callback but only once.
            // Constructor is too early and can't run handleAdminChosen, and Connected Callback just doesn't get called
            // all together when coming from Edit Admin button for whatever reason
            this.gotURLParams = true;

            let urlParamAdmin = this.currentPageReference.state.c__AdminChosen;

            if (urlParamAdmin) {
                this.adminChosen = urlParamAdmin;

                this.handleAdminChosen();
            }
        }


        if(this.s3) {
            if(this.s3.isActive()) {


                // OLD, new using my S3 Interface Implementation
                /*
                this.s3.listObjects({Bucket: 'admin-snapshots'}, (err, data) => {
                    if(err) {
                        this.toast.displayError(err.body ? err.body.message : err.message);
                        console.log(err);
                    }else {
                        console.log('Objects . . .');
        
                        for(let i = 0; i < data.Objects.length; i++) {
                            console.log(data.Objects[i].Name);
                        }
        
                        console.log('. . .');
                    }
                });
                */
            }
        }
    }
}