import { LightningElement } from 'lwc';

import { LWC_Toast } from "c/lwc_generic_prototype";
import {LWC_Element, Attribute_Handler} from 'c/lwc_js_common';

import Id from '@salesforce/user/Id';

import queryFromString from '@salesforce/apex/ApexDataInterface.queryFromString';



export default class Admin_search extends LightningElement {
    toastHandler;

    arbitraryAttributeHandler;
    numberAttributeHandler;
    currencyAttributeHandler;
    percentAttributeHandler;

    currentUser = Id;

    lookUpAdmin_elements;

    searchResults;
    hasSearchResults;


    createLWCElements() {
        if(!this.lookUpAdmin_elements) {
            this.lookUpAdmin_elements = {};
        
            /*
            this.lookUpAdmin_elements.lookUpAdmin_Salesman = new LWC_Element(
                // data-id
                'lookUpAdmin_Salesman',
                
                // Reference to this context so query dom element can be applied
                this.template,
                
                // This was made to handle the different formatting situations for a given attribute that create problems
                // when you need to get/set the values and pass them to apex, etc.
                this.arbitraryAttributeHandler, 

                // This is an object that holds the key-pairs of events as keys where the handler is kept within the given
                // context by using an arrow function to call it
                {
                    'focusout': (event) => {
                        this.handleDOMInput(event);
                    }
                }
            );
            */
            this.lookUpAdmin_elements.lookUpAdmin_Salesman = new LWC_Element(
                // data-id
                'lookUpAdmin_Salesman',
                
                // Reference to this context so query dom element can be applied
                this.template,
                
                // This was made to handle the different formatting situations for a given attribute that create problems
                // when you need to get/set the values and pass them to apex, etc.
                this.arbitraryAttributeHandler, 

                // This is an object that holds the key-pairs of events as keys where the handler is kept within the given
                // context by using an arrow function to call it
                {}
            );
        

            this.lookUpAdmin_elements.lookUpAdmin_Customer = new LWC_Element(
                // data-id
                'lookUpAdmin_Customer',
                
                // Reference to this context so query dom element can be applied
                this.template,
                
                // This was made to handle the different formatting situations for a given attribute that create problems
                // when you need to get/set the values and pass them to apex, etc.
                this.arbitraryAttributeHandler, 

                // This is an object that holds the key-pairs of events as keys where the handler is kept within the given
                // context by using an arrow function to call it
                {
                    'focusout': (event) => {
                        this.handleDOMInput(event);
                    }
                }
            );


            this.lookUpAdmin_elements.lookUpAdmin_Date = new LWC_Element(
                // data-id
                'lookUpAdmin_Date',
                
                // Reference to this context so query dom element can be applied
                this.template,
                
                // This was made to handle the different formatting situations for a given attribute that create problems
                // when you need to get/set the values and pass them to apex, etc.
                this.arbitraryAttributeHandler, 

                // This is an object that holds the key-pairs of events as keys where the handler is kept within the given
                // context by using an arrow function to call it
                {
                    'focusout': (event) => {
                        this.handleDOMInput(event);
                    }
                }
            );
        }
    }



    constructor() {
        super();


        this.arbitraryAttributeHandler = new Attribute_Handler('arbitrary');
        this.numberAttributeHandler = new Attribute_Handler('number');
        this.currencyAttributeHandler = new Attribute_Handler('currency');
        this.percentAttributeHandler = new Attribute_Handler('percent');


        this.toastHandler = new LWC_Toast(this);


        this.createLWCElements();
    }



    handleDOMInput(event) {
        switch(event.target.getAttribute("data-id")) {
            //case 'lookUpAdmin_Salesman':
            //    break;

            case 'lookUpAdmin_Customer':
                break;

            case 'lookUpAdmin_Date':
                break;
            
            default:
                break;
        }
    }


    handleClick_SearchAdmin() {
        //console.log('Clicked Search Admin');

        let lookUpString =
            'SELECT Name, Name__c, Salesman__r.Name, Date__c, Customer_Name__c, LastModifiedDate, CreatedDate' +
            ' FROM AdminChecklist__c';

        let whereString = '';
        let hasWhere = false;

        if(this.lookUpAdmin_elements.lookUpAdmin_Salesman.getAttribute('value')) {
            whereString += 'Salesman__c = \'' + this.lookUpAdmin_elements.lookUpAdmin_Salesman.getAttribute('value') + '\'';

            hasWhere = true;
        }

        if(this.lookUpAdmin_elements.lookUpAdmin_Customer.getAttribute('value')) {
            if(hasWhere) {
                whereString += ' AND ';
            }

            whereString += 'Customer_Name__c LIKE \'%' + this.lookUpAdmin_elements.lookUpAdmin_Customer.getAttribute('value') + '%\'';

            hasWhere = true;
        }


        if(this.lookUpAdmin_elements.lookUpAdmin_Date.getAttribute('value')) {
            if(hasWhere) {
                whereString += ' AND ';
            }

            whereString += 'Date__c = ' + this.lookUpAdmin_elements.lookUpAdmin_Date.getAttribute('value');

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

                    this.searchResults.push({
                        index: recordIndex,

                        id: records[recordIndex].Id,

                        date: records[recordIndex].Date__c,

                        created: records[recordIndex].CreatedDate.split('Z')[0].replace('T', ' ').split('.')[0],

                        lastModified: records[recordIndex].LastModifiedDate.split('Z')[0].replace('T', ' ').split('.')[0],

                        salesman: records[recordIndex].Salesman__r.Name,

                        customer: records[recordIndex].Customer_Name__c
                    });


                    if(records[recordIndex].Name__c) {
                        this.searchResults[recordIndex].name = records[recordIndex].Name__c + ' (' + records[recordIndex].Name + ')';
                    }else {
                        this.searchResults[recordIndex].name = records[recordIndex].Name;
                    }
                }
            }else {
                this.hasSearchResults = false;
            }
        }).catch(err => {
            console.log(err.body ? err.body.message : err.message);
        });
    }


    handleSearchSelection(event) {
        try {
            let admin = event.currentTarget.getAttribute('data-id');
            //this.handleAdminChosen();
            let adminChosen = new CustomEvent('adminchosen', {detail: {value: admin}});
            this.dispatchEvent(adminChosen);
        }catch(err) {
            console.log(err.body ? err.body.message : err.message);
        }
    }



    initializeLWC_Elements() {
        if(!this.lookUpAdmin_elements.lookUpAdmin_Salesman.isInitialized) {
            for(const key in this.lookUpAdmin_elements) {
                this.lookUpAdmin_elements[key].initialize();
            }


            // Default Salesman Lookup to Current User
            this.lookUpAdmin_elements.lookUpAdmin_Salesman.setAttribute('value', this.currentUser);
        }
    }


    renderedCallback() {
        this.initializeLWC_Elements();
    }
}

