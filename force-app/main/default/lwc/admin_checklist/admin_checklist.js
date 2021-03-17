import { LightningElement } from 'lwc';

import Id from '@salesforce/user/Id';


class LWC_Element {
    // The Id used to query the dom for this specific element
    dataId;

    // The reference to the dom element itself so its attributes can be read and written to and
    // event listeners added, etc.
    domElement;

    // To ensure the dom is queried only once, since renderedCallback is run multiple times
    isInitialized;

    constructor(dataId) {
        this.dataId = dataId;

        this.isInitialized = false;
    }


    queryDOM(templateReference) {
        this.domElement = templateReference.querySelector("[data-id='" + this.dataId + "']");

        this.isInitialized = true;
    }
}



export default class Admin_checklist extends LightningElement {
    currentUser = Id;

    lookUpQuote_elements;
    lookUpQuote_searchButton;

    whoWhat_elements;
    fetCredit_elements;
    tradeIn_elements;
    finances_elements;
    quote_saveButton;
    quote_printButton;
    quote_cloneButton;

    

    displayError(title, errorMessage) {
        const errorToast = new ShowToastEvent({
            title: title,
            message: errorMessage,
            variant: 'error',
            mode: 'sticky'
        });

        console.log(errorMessage);

        this.dispatchEvent(errorToast);
    }


    handleDOMInput(event) {
        switch(event.target.getAttribute("data-id")) {
            case 'lookUpQuote_Salesman':
                console.log(this.lookUpQuote_elements.lookUpQuote_Salesman.domElement.value);
                break;

            case 'lookUpQuote_Customer':
                console.log(this.lookUpQuote_elements.lookUpQuote_Customer.domElement.value);
                break;

            case 'lookUpQuote_searchButton':
                console.log('Search Clicked');
                break;


            case 'whoWhat_Salesman':
                console.log(this.whoWhat_elements.whoWhat_Salesman.domElement.value);
                break;

            case 'whoWhat_Customer':
                console.log(this.whoWhat_elements.whoWhat_Customer.domElement.value);
                break;

            case 'whoWhat_Date':
                console.log(this.whoWhat_elements.whoWhat_Date.domElement.value);
                break;
            
            case 'whoWhat_Chassis_Make':
                console.log(this.whoWhat_elements.whoWhat_Chassis_Make.domElement.value);
                break;

            case 'whoWhat_Chassis_Model':
                console.log(this.whoWhat_elements.whoWhat_Chassis_Model.domElement.value);
                break;

            case 'whoWhat_Chassis_Year':
                console.log(this.whoWhat_elements.whoWhat_Chassis_Year.domElement.value);
                break;

            case 'whoWhat_Chassis_VIN':
                console.log(this.whoWhat_elements.whoWhat_Chassis_VIN.domElement.value);
                break;

            case 'whoWhat_Body_Name':
                console.log(this.whoWhat_elements.whoWhat_Body_Name.domElement.value);
                break;


            case 'fetCredit_FET_Front_Description':
                console.log(this.fetCredit_elements.fetCredit_FET_Front_Description.domElement.value);
                break;

            case 'fetCredit_FET_Front_Size':
                console.log(this.fetCredit_elements.fetCredit_FET_Front_Size.domElement.value);
                break;

            case 'fetCredit_FET_Front_Cost':
                console.log(this.fetCredit_elements.fetCredit_FET_Front_Cost.domElement.value);

                this.fetCredit_elements.fetCredit_FET_Front_Subtotal.domElement.value = Number(this.fetCredit_FET_Front_Cost) * Number(this.fetCredit_FET_Front_Quantity);

                this.fetCredit_FET_Total.domElement.value = Number(this.fetCredit_FET_Front_Subtotal) + Number(this.fetCredit_FET_Rear_Subtotal);
                break;

            case 'fetCredit_FET_Front_Quantity':
                console.log(this.fetCredit_elements.fetCredit_FET_Front_Quantity.domElement.value);

                this.fetCredit_elements.fetCredit_FET_Front_Subtotal.domElement.value = Number(this.fetCredit_FET_Front_Cost) * Number(this.fetCredit_FET_Front_Quantity);

                this.fetCredit_FET_Total.domElement.value = Number(this.fetCredit_FET_Front_Subtotal) + Number(this.fetCredit_FET_Rear_Subtotal);

                break;


            case 'fetCredit_FET_Rear_Description':
                console.log(this.fetCredit_elements.fetCredit_FET_Rear_Description.domElement.value);
                break;

            case 'fetCredit_FET_Rear_Size':
                console.log(this.fetCredit_elements.fetCredit_FET_Rear_Size.domElement.value);
                break;
            
            case 'fetCredit_FET_Rear_Cost':
                console.log(this.fetCredit_elements.fetCredit_FET_Rear_Cost.domElement.value);

                this.fetCredit_elements.fetCredit_FET_Rear_Subtotal.domElement.value = Number(this.fetCredit_FET_Rear_Cost) * Number(this.fetCredit_FET_Rear_Quantity);

                this.fetCredit_FET_Total.domElement.value = Number(this.fetCredit_FET_Front_Subtotal) + Number(this.fetCredit_FET_Rear_Subtotal);
                break;

            case 'fetCredit_FET_Rear_Quantity':
                console.log(this.fetCredit_elements.fetCredit_FET_Rear_Quantity.domElement.value);

                this.fetCredit_elements.fetCredit_FET_Rear_Subtotal.domElement.value = Number(this.fetCredit_FET_Rear_Cost) * Number(this.fetCredit_FET_Rear_Quantity);

                this.fetCredit_FET_Total.domElement.value = Number(this.fetCredit_FET_Front_Subtotal) + Number(this.fetCredit_FET_Rear_Subtotal);
                break;
            

            default:
                break;
        }
    }


    createLWC_Elements() {
        if(!this.lookUpQuote_searchButton) {
            this.lookUpQuote_searchButton = new LWC_Element('lookUpQuote_searchButton');
        }

        if(!this.lookUpQuote_elements) {
            this.lookUpQuote_elements = {};

            this.lookUpQuote_elements.lookUpQuote_Salesman = new LWC_Element('lookUpQuote_Salesman');
            this.lookUpQuote_elements.lookUpQuote_Customer = new LWC_Element('lookUpQuote_Customer');
        }


        if(!this.whoWhat_elements) {
            this.whoWhat_elements = {};

            this.whoWhat_elements.whoWhat_Salesman = new LWC_Element('whoWhat_Salesman');
            this.whoWhat_elements.whoWhat_Customer = new LWC_Element('whoWhat_Customer');
            this.whoWhat_elements.whoWhat_Date = new LWC_Element('whoWhat_Date');
            this.whoWhat_elements.whoWhat_Chassis_Make = new LWC_Element('whoWhat_Chassis_Make');
            this.whoWhat_elements.whoWhat_Chassis_Model = new LWC_Element('whoWhat_Chassis_Model');
            this.whoWhat_elements.whoWhat_Chassis_Year = new LWC_Element('whoWhat_Chassis_Year');
            this.whoWhat_elements.whoWhat_Chassis_VIN = new LWC_Element('whoWhat_Chassis_VIN');
            this.whoWhat_elements.whoWhat_Body_Name = new LWC_Element('whoWhat_Body_Name');
        }


        if(!this.fetCredit_elements) {
            this.fetCredit_elements = {};

            this.fetCredit_elements.fetCredit_FET_Front_Description = new LWC_Element('fetCredit_FET_Front_Description');
            this.fetCredit_elements.fetCredit_FET_Front_Size = new LWC_Element('fetCredit_FET_Front_Size');
            this.fetCredit_elements.fetCredit_FET_Front_Cost = new LWC_Element('fetCredit_FET_Front_Cost');
            this.fetCredit_elements.fetCredit_FET_Front_Quantity = new LWC_Element('fetCredit_FET_Front_Quantity');
            this.fetCredit_elements.fetCredit_FET_Front_Subtotal = new LWC_Element('fetCredit_FET_Front_Subtotal');

            this.fetCredit_elements.fetCredit_FET_Rear_Description = new LWC_Element('fetCredit_FET_Rear_Description');
            this.fetCredit_elements.fetCredit_FET_Rear_Size = new LWC_Element('fetCredit_FET_Rear_Size');
            this.fetCredit_elements.fetCredit_FET_Rear_Cost = new LWC_Element('fetCredit_FET_Rear_Cost');
            this.fetCredit_elements.fetCredit_FET_Rear_Quantity = new LWC_Element('fetCredit_FET_Rear_Quantity');
            this.fetCredit_elements.fetCredit_FET_Rear_Subtotal = new LWC_Element('fetCredit_FET_Rear_Subtotal');

            this.fetCredit_elements.fetCredit_FET_Total = new LWC_Element('fetCredit_FET_Total');
        }
    }


    constructor() {
        super();

        this.createLWC_Elements();
    }



    renderedCallback() {
        if(!this.lookUpQuote_searchButton.isInitialized) {
            this.lookUpQuote_searchButton.queryDOM(this.template);

            this.lookUpQuote_searchButton.domElement.addEventListener('click', this.handleDOMInput.bind(this));
        }


        if(!this.lookUpQuote_elements.lookUpQuote_Salesman.isInitialized) {
            for(const key in this.lookUpQuote_elements) {
                this.lookUpQuote_elements[key].queryDOM(this.template);

                this.lookUpQuote_elements[key].domElement.addEventListener('change', this.handleDOMInput.bind(this));
            }


            // Default Salesman Lookup to Current User
            this.lookUpQuote_elements.lookUpQuote_Salesman.domElement.value = this.currentUser;
        }


        if(!this.whoWhat_elements.whoWhat_Salesman.isInitialized) {
            for(const key in this.whoWhat_elements) {
                this.whoWhat_elements[key].queryDOM(this.template);

                this.whoWhat_elements[key].domElement.addEventListener('change', this.handleDOMInput.bind(this));
            }

            // Default Salesman Lookup to Current User
            this.whoWhat_elements.whoWhat_Salesman.domElement.value = this.currentUser;
        }


        if(!this.fetCredit_elements.fetCredit_FET_Front_Description.isInitialized) {
            for(const key in this.fetCredit_elements) {
                this.fetCredit_elements[key].queryDOM(this.template);

                this.fetCredit_elements[key].domElement.addEventListener('change', this.handleDOMInput.bind(this));
            }
        }
    }
}