import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { LWC_Toast } from "c/lwc_generic_prototype";

import updateRecordFromId from '@salesforce/apex/Apex_Generic_Prototype.updateRecordFromId';
import queryFromString from '@salesforce/apex/Apex_Generic_Prototype.queryFromString';

import insertRecord from '@salesforce/apex/AdminChecklist_Controller.insertRecord';

import { View } from "c/lwc_mvc_prototype2";


export default class Admin_in_opportunity extends NavigationMixin(LightningElement) {
    @api recordId;
    
    recordData;

    toastHandler;

    /*
    arbitraryAttributeHandler;
    numberAttributeHandler;
    currencyAttributeHandler;
    percentAttributeHandler;
    */


    admin;
    adminName;


    //newAdminButton;
    //editAdminButton;


    adminNavAttr;
    adminNavState;


    /*
    createLWCElements() {
        if(!this.newAdminButton) {
            this.newAdminButton = new LWC_Element(
                // data-id
                'New_Admin_Button',
                
                // Reference to this context so query dom element can be applied
                this.template,
                
                // This was made to handle the different formatting situations for a given attribute that create problems
                // when you need to get/set the values and pass them to apex, etc.
                this.arbitraryAttributeHandler, 

                // This is an object that holds the key-pairs of events as keys where the handler is kept within the given
                // context by using an arrow function to call it
                {}
            );
        }

        if(!this.editAdminButton) {
            this.editAdminButton = new LWC_Element(
                // data-id
                'Edit_Admin_Button',
                
                // Reference to this context so query dom element can be applied
                this.template,
                
                // This was made to handle the different formatting situations for a given attribute that create problems
                // when you need to get/set the values and pass them to apex, etc.
                this.arbitraryAttributeHandler, 

                // This is an object that holds the key-pairs of events as keys where the handler is kept within the given
                // context by using an arrow function to call it
                {}
            );
        }
    }
    */


    initializeRecordData() {
        return queryFromString({ queryString: 'SELECT AdminChecklist__c, AdminChecklist__r.Name, Account.Name FROM Opportunity WHERE Id=\'' + this.recordId + '\'' }).then(records => {
            if(records && records.length > 0) {
                this.recordData = records[0];
            }
        }).catch(err => {
            console.error(err.body ? err.body.message : err.message);
        });
    }


    constructor() {
        super();

        /*
        this.arbitraryAttributeHandler = new Attribute_Handler('arbitrary');
        this.numberAttributeHandler = new Attribute_Handler('number');
        this.currencyAttributeHandler = new Attribute_Handler('currency');
        this.percentAttributeHandler = new Attribute_Handler('percent');
        */


        this.toastHandler = new LWC_Toast(this);


        //this.createLWCElements();

        this.adminNavAttr = {
            apiName: 'Admin_Checklist'
        };

        this.adminNavState = {};


        this.view = new View();
    }


    connectedCallback() {
        this.initializeRecordData().then(() => {
            if(this.recordData.AdminChecklist__c) {
                this.adminNavState.c__AdminChosen = this.recordData.AdminChecklist__c;

                this.admin = this.recordData.AdminChecklist__c;
                this.adminName = this.recordData.AdminChecklist__r.Name;

                // this.initializeLWC_Elements(); // OLD
            }
        }).catch(err => {
            console.error(err.body ? err.body.message : err.message);
        });
    }


    // OLD
    /*
    initializeLWC_Elements() {
        this.newAdminButton.initialize();


        this.editAdminButton.initialize();
    }
    */


    renderedCallback() {
        this.view.updateNodes( this.template.querySelectorAll("[data-track='true']") );

        // Since Calling Child with a string has no good solution, I will have a method on View where I can be given the DOM Element
        // so that I can call methods on it. Unfortunately that defeats all the attempts at encapsulation I made, but whatever.c/admin_checklist
        try {
            if(this.view.getElementToCall("Snapshots")) {
                this.view.getElementToCall("Snapshots").updateAdminId(this.admin);
            }
        } catch(err) {
            console.error(err.message);
        }

        //this.view.callChild("Snapshots", "updateAdminId", [this.adminId]);

        //this.initializeLWC_Elements(); //OLD
    }


    handleAdminChosen(event) {
        console.log('Admin: ' + event.detail.value);
        console.log('Opportunity: ' + this.recordId);

        updateRecordFromId({ objectName: 'Opportunity', recordId: this.recordId, fieldValuePairs: {'AdminChecklist__c': event.detail.value}}).then(isSuccess => {
            location.reload();
        }).catch(err => {
            console.error(err.body ? err.body.message : err.message);
        });
    }

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
                    // this.editAdminButton.domElement.navigate(); // OLD From previous approach

                    this[NavigationMixin.Navigate]({
                        type: 'standard__navItemPage',

                        attributes: this.adminNavAttr,

                        state: this.adminNavState
                    });
                }else {
                    console.log('(admin_in_opportunity) updateRecordFromId came back as unsuccessful');
                }
            }).catch(err => {
                console.error(err.body ? err.body.message : err.message);
            });
        }).catch(err => {
            console.error(err.body ? err.body.message : err.message);
        });
    }


    handleClick_EditAdmin() {
        try {
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',

                attributes: this.adminNavAttr,

                state: this.adminNavState
            });


            //this.editAdminButton.domElement.navigate(); // OLD
        }catch(e) {
            console.error(err.body ? err.body.message : err.message);
        }
    }
}
