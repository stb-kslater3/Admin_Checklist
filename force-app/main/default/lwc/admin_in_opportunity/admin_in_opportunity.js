import { LightningElement, api } from 'lwc';

import {LWC_Toast, LWC_Element, LWC_Input_Element, Attribute_Handler} from 'c/lwc_js_common';

import updateRecordFromId from '@salesforce/apex/ApexDataInterface.updateRecordFromId';
import queryFromString from '@salesforce/apex/ApexDataInterface.queryFromString';

import insertRecord from '@salesforce/apex/AdminChecklist_Controller.insertRecord';


export default class Admin_in_opportunity extends LightningElement {
    @api recordId;
    
    recordData;

    toastHandler;

    arbitraryAttributeHandler;
    numberAttributeHandler;
    currencyAttributeHandler;
    percentAttributeHandler;


    admin;
    adminName;


    newAdminButton;
    editAdminButton;


    adminNavAttr;
    adminNavState;


    createLWCElements() {
        if(!this.newAdminButton) {
            this.newAdminButton = new LWC_Element('New_Admin_Button', this.template, this.arbitraryAttributeHandler);
        }

        if(!this.editAdminButton) {
            this.editAdminButton = new LWC_Element('Edit_Admin_Button', this.template, this.arbitraryAttributeHandler);
        }
    }


    initializeRecordData() {
        return queryFromString({ queryString: 'SELECT AdminChecklist__c, AdminChecklist__r.Name, Account.Name FROM Opportunity WHERE Id=\'' + this.recordId + '\'' }).then(records => {
            if(records && records.length > 0) {
                this.recordData = records[0];
            }
        }).catch(err => {
            this.toastHandler.displayError('Something Went Wrong!', 'Error in call to queryFromString in initializeRecordData for this Opportunity', err);
        });
    }


    constructor() {
        super();


        this.arbitraryAttributeHandler = new Attribute_Handler('arbitrary');
        this.numberAttributeHandler = new Attribute_Handler('number');
        this.currencyAttributeHandler = new Attribute_Handler('currency');
        this.percentAttributeHandler = new Attribute_Handler('percent');


        this.toastHandler = new LWC_Toast(this);


        this.createLWCElements();

        this.adminNavAttr = {
            apiName: 'Admin_Checklist'
        };

        this.adminNavState = {};
    }


    connectedCallback() {
        this.initializeRecordData().then(() => {
            if(this.recordData.AdminChecklist__c) {
                this.adminNavState.c__AdminChosen = this.recordData.AdminChecklist__c;

                this.admin = this.recordData.AdminChecklist__c;
                this.adminName = this.recordData.AdminChecklist__r.Name;

                this.initializeLWC_Elements();
            }
        }).catch(err => {
            this.toastHandler.displayError('Something Went Wrong!', '(admin_in_opportunity) Error in call to then of initializeRecordData within the Constructor', err);
        });
    }


    initializeLWC_Elements() {
        this.newAdminButton.initialize();


        this.editAdminButton.initialize();
    }


    renderedCallback() {
        this.initializeLWC_Elements();
    }


    handleAdminChosen(event) {
        console.log('Admin: ' + event.detail.value);
        console.log('Opportunity: ' + this.recordId);

        updateRecordFromId({ objectName: 'Opportunity', recordId: this.recordId, fieldValuePairs: {'AdminChecklist__c': event.detail.value}}).then(isSuccess => {
            location.reload();
        }).catch(err => {
            this.toastHandler.displayError('Something Went Wrong!', '(admin_in_opportunity) Error in call to updateRecordFromId for Opportunity in handleAdminChosen', err);
        });
    }

    // TODO: Set the admin field of this Opportunity with the returned admin Id before you make the call to navigate
    handleClick_NewAdmin(event) {
        insertRecord({ objectName: 'AdminChecklist__c', fieldValuePairs: {
            Customer_Name__c: this.recordData.Account.Name
        } }).then(id => {
            this.adminNavState.c__AdminChosen = id;

            this.admin = id;

            updateRecordFromId({ objectName: 'Opportunity', recordId: this.recordId, fieldValuePairs: {'AdminChecklist__c': this.admin} }).then(isSuccess => {
                if(isSuccess) {
                    // When this.admin = id; above it sets admin which changes the template to if:true={admin}
                    // So I need the editAdminButtonInstead because it switches real quick
                    this.editAdminButton.domElement.navigate();
                }else {
                    console.log('(admin_in_opportunity) updateRecordFromId came back as unsuccessful');
                }
            }).catch(err => {
                this.toastHandler.displayError('Something Went Wrong!', '(admin_in_opportunity) Error in call to updateRecordFromId in insertRecord of handleClick_NewAdmin', err);
            });
        }).catch(err => {
            this.toastHandler.displayError('Something Went Wrong!', '(admin_in_opportunity) Error in call to insertRecord for AdminChecklist in handleClick_NewAdmin', err);
        });
    }


    handleClick_EditAdmin() {
        try {
            //this.editAdminButton.domElement.navigate();
        }catch(e) {
            this.toastHandler.displayError('Something Went Wrong!', '(admin_in_opportunity) Error in call to editAdminButton.Navigate', e);
        }
    }
}
