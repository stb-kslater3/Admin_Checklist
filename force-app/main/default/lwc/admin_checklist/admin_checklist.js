import { LightningElement } from 'lwc';

import Id from '@salesforce/user/Id';


class LWC_Error {
    thisReference;

    constructor(thisReference) {
        this.thisReference = thisReference;
    }


    displayError(title, errorMessage) {
        const errorToast = new ShowToastEvent({
            title: title,
            message: errorMessage,
            variant: 'error',
            mode: 'sticky'
        });

        console.log(errorMessage);

        this.thisReference.dispatchEvent(errorToast);
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

    constructor(dataId, templateReference) {
        this.dataId = dataId;

        this.isInitialized = false;

        this.templateReference = templateReference;
    }


    initialize() {
        this.domElement = this.templateReference.querySelector("[data-id='" + this.dataId + "']");

        this.isInitialized = true;
    }
}


class LWC_Input_Element extends LWC_Element {
    // The callback function that handles Changes
    changeHandler;

    constructor(dataId, templateReference, changeHandler) {
        super(dataId, templateReference);

        this.changeHandler = changeHandler;
    }


    initialize() {
        // Note that I call the protype method so I need to bind this context to access my properties
        LWC_Element.prototype.initialize.call(this);

        this.domElement.addEventListener('change', this.handleChange.bind(this));
    }


    handleChange(event) {
        console.log(this.domElement.value);

        this.changeHandler(event);
    }
}



export default class Admin_checklist extends LightningElement {
    currentUser = Id;


    errorHandler;


    lookUpQuote_elements;
    lookUpQuote_searchButton;

    whoWhat_elements;
    fetCredit_elements;
    tradeIn_elements;
    finances_elements;
    quote_saveButton;
    quote_printButton;
    quote_cloneButton;


    calculateTotalBeforeProfit() {
        this.finances_elements.finances_Subtotal_Before_Profit.domElement.value =
            Number(this.finances_elements.finances_Chassis_Cost.domElement.value) +
            Number(this.finances_elements.finances_Body_Cost.domElement.value) +
            Number(this.finances_elements.finances_PO_Freight_Transport.domElement.value) +
            Number(this.finances_elements.finances_PO_AOrder.domElement.value) +
            Number(this.finances_elements.finances_PO_BOrder.domElement.value) +
            Number(this.finances_elements.finances_PO_COrder.domElement.value) +
            Number(this.finances_elements.finances_PO_Other_1.domElement.value) +
            Number(this.finances_elements.finances_PO_Other_2.domElement.value) +
            Number(this.finances_elements.finances_PO_Other_3.domElement.value);
    }

    calculateTotalAfterProfit() {
        this.finances_elements.finances_Subtotal_After_Profit.domElement.value =
            this.finances_elements.finances_Subtotal_Before_Profit.domElement.value +
            this.finances_elements.finances_Profit_Amount.domElement.value;
    }


    calculateFETTotals() {
        this.fetCredit_elements.fetCredit_FET_Front_Subtotal.domElement.value = Number(this.fetCredit_elements.fetCredit_FET_Front_Cost.domElement.value) * Number(this.fetCredit_elements.fetCredit_FET_Front_Quantity.domElement.value);

        this.fetCredit_elements.fetCredit_FET_Rear_Subtotal.domElement.value = Number(this.fetCredit_elements.fetCredit_FET_Rear_Cost.domElement.value) * Number(this.fetCredit_elements.fetCredit_FET_Rear_Quantity.domElement.value);

        this.fetCredit_elements.fetCredit_FET_Total.domElement.value = Number(this.fetCredit_elements.fetCredit_FET_Front_Subtotal.domElement.value) + Number(this.fetCredit_elements.fetCredit_FET_Rear_Subtotal.domElement.value);
    }


    handleDOMInput(event) {
        switch(event.target.getAttribute("data-id")) {
            case 'finances_Chassis_Cost':
                this.calculateTotalBeforeProfit();

                break;

            case 'finances_Body_Cost':
                this.calculateTotalBeforeProfit();
                
                break;

            case 'finances_Freight_Transport':
                this.calculateTotalBeforeProfit();
                
                break;

            case 'finances_PO_AOrder':
                this.calculateTotalBeforeProfit();
                
                break;

            case 'finances_PO_BOrder':
                this.calculateTotalBeforeProfit();
                
                break;

            case 'finances_PO_COrder':
                this.calculateTotalBeforeProfit();
                
                break;

            case 'finances_PO_Other_1':
                this.calculateTotalBeforeProfit();
                
                break;

            case 'finances_PO_Other_2':
                this.calculateTotalBeforeProfit();
                
                break;

            case 'finances_PO_Other_3':
                this.calculateTotalBeforeProfit();
                
                break;


            case 'fetCredit_FET_Front_Cost':
                this.calculateFETTotals();
                
                break;

            case 'fetCredit_FET_Front_Quantity':
                this.calculateFETTotals();
                
                break;
            
            case 'fetCredit_FET_Rear_Cost':
                this.calculateFETTotals();
                
                break;

            case 'fetCredit_FET_Rear_Quantity':
                this.calculateFETTotals();
                
                break;
            

            default:
                break;
        }
    }


    createLWC_Elements() {
        if(!this.lookUpQuote_searchButton) {
            this.lookUpQuote_searchButton = new LWC_Input_Element('lookUpQuote_searchButton', this.template, this.handleDOMInput.bind(this));
        }

        if(!this.lookUpQuote_elements) {
            this.lookUpQuote_elements = {};

            this.lookUpQuote_elements.lookUpQuote_Salesman = new LWC_Input_Element('lookUpQuote_Salesman', this.template, this.handleDOMInput.bind(this));
            this.lookUpQuote_elements.lookUpQuote_Customer = new LWC_Input_Element('lookUpQuote_Customer', this.template, this.handleDOMInput.bind(this));

            this.lookUpQuote_elements.lookUpQuote_OpportunityAdmin = new LWC_Input_Element('lookUpQuote_OpportunityAdmin', this.template, this.handleDOMInput.bind(this));
        }


        if(!this.whoWhat_elements) {
            this.whoWhat_elements = {};

            this.whoWhat_elements.whoWhat_OpportunityAdmin = new LWC_Input_Element('whoWhat_OpportunityAdmin', this.template, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Salesman = new LWC_Input_Element('whoWhat_Salesman', this.template, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Customer = new LWC_Input_Element('whoWhat_Customer', this.template, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Date = new LWC_Input_Element('whoWhat_Date', this.template, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Chassis_Make = new LWC_Input_Element('whoWhat_Chassis_Make', this.template, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Chassis_Model = new LWC_Input_Element('whoWhat_Chassis_Model', this.template, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Chassis_Year = new LWC_Input_Element('whoWhat_Chassis_Year', this.template, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Chassis_VIN = new LWC_Input_Element('whoWhat_Chassis_VIN', this.template, this.handleDOMInput.bind(this));
            this.whoWhat_elements.whoWhat_Body_Series_Name = new LWC_Input_Element('whoWhat_Body_Series_Name', this.template, this.handleDOMInput.bind(this));
        }


        if(!this.quote_saveButton) {
            this.quote_saveButton = new LWC_Input_Element('quote_saveButton', this.template, this.handleDOMInput.bind(this));
        }

        if(!this.quote_printButton) {
            this.quote_printButton = new LWC_Input_Element('quote_printButton', this.template, this.handleDOMInput.bind(this));
        }

        if(!this.quote_cloneButton) {
            this.quote_cloneButton = new LWC_Input_Element('quote_cloneButton', this.template, this.handleDOMInput.bind(this));
        }

        if(!this.finances_elements) {
            this.finances_elements = {};

            this.finances_elements.finances_Chassis_Cost = new LWC_Input_Element('finances_Chassis_Cost', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Body_Cost = new LWC_Input_Element('finances_Body_Cost', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO_Freight_Transport = new LWC_Input_Element('finances_PO_Freight_Transport', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO_AOrder = new LWC_Input_Element('finances_PO_AOrder', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO_BOrder = new LWC_Input_Element('finances_PO_BOrder', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO_COrder = new LWC_Input_Element('finances_PO_COrder', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO_Other_1 = new LWC_Input_Element('finances_PO_Other_1', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO_Other_2 = new LWC_Input_Element('finances_PO_Other_2', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_PO_Other_3 = new LWC_Input_Element('finances_PO_Other_3', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Subtotal_Before_Profit = new LWC_Element('finances_Subtotal_Before_Profit', this.template);

            this.finances_elements.finances_Profit_Amount = new LWC_Input_Element('finances_Profit_Amount', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Profit_Percent = new LWC_Element('finances_Profit_Percent', this.template);
            this.finances_elements.finances_Dealer_Pack = new LWC_Input_Element('finances_Dealer_Pack', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Gross_Amount = new LWC_Element('finances_Gross_Amount', this.template);
            this.finances_elements.finances_Gross_Percent = new LWC_Element('finances_Gross_Percent', this.template);

            this.finances_elements.finances_Subtotal_After_Profit = new LWC_Element('finances_Subtotal_After_Profit', this.template);
            this.finances_elements.finances_12_FET = new LWC_Element('finances_12_FET', this.template);
            this.finances_elements.finances_Minus_Tire_FET = new LWC_Input_Element('finances_Minus_Tire_FET', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Total_FET = new LWC_Element('finances_Total_FET', this.template);
            this.finances_elements.finances_Extended_Warranty = new LWC_Input_Element('finances_Extended_Warranty', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Other_Fees = new LWC_Input_Element('finances_Other_Fees', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Documentation_Fee = new LWC_Input_Element('finances_Documentation_Fee', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Deposit = new LWC_Input_Element('finances_Deposit', this.template, this.handleDOMInput.bind(this));
            this.finances_elements.finances_Total = new LWC_Element('finances_Total', this.template);
        }


        if(!this.tradeIn_elements) {
            this.tradeIn_elements = {};

            this.tradeIn_elements.tradeIn_Make = new LWC_Input_Element('tradeIn_Make', this.template, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Model = new LWC_Input_Element('tradeIn_Model', this.template, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Year = new LWC_Input_Element('tradeIn_Year', this.template, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Unit_Number = new LWC_Input_Element('tradeIn_Unit_Number', this.template, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Actual_Cash_Value = new LWC_Input_Element('tradeIn_Actual_Cash_Value', this.template, this.handleDOMInput.bind(this));
            this.tradeIn_elements.tradeIn_Billing_Amount = new LWC_Input_Element('tradeIn_Billing_Amount', this.template, this.handleDOMInput.bind(this));
        }


        if(!this.fetCredit_elements) {
            this.fetCredit_elements = {};

            this.fetCredit_elements.fetCredit_FET_Front_Description = new LWC_Input_Element('fetCredit_FET_Front_Description', this.template, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Front_Size = new LWC_Input_Element('fetCredit_FET_Front_Size', this.template, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Front_Cost = new LWC_Input_Element('fetCredit_FET_Front_Cost', this.template, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Front_Quantity = new LWC_Input_Element('fetCredit_FET_Front_Quantity', this.template, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Front_Subtotal = new LWC_Element('fetCredit_FET_Front_Subtotal', this.template);

            this.fetCredit_elements.fetCredit_FET_Rear_Description = new LWC_Input_Element('fetCredit_FET_Rear_Description', this.template, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Rear_Size = new LWC_Input_Element('fetCredit_FET_Rear_Size', this.template, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Rear_Cost = new LWC_Input_Element('fetCredit_FET_Rear_Cost', this.template, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Rear_Quantity = new LWC_Input_Element('fetCredit_FET_Rear_Quantity', this.template, this.handleDOMInput.bind(this));
            this.fetCredit_elements.fetCredit_FET_Rear_Subtotal = new LWC_Element('fetCredit_FET_Rear_Subtotal', this.template);

            this.fetCredit_elements.fetCredit_FET_Total = new LWC_Element('fetCredit_FET_Total', this.template);
        }
    }


    constructor() {
        super();

        this.errorHandler = new LWC_Error(this);

        this.createLWC_Elements();
    }



    renderedCallback() {
        if(!this.lookUpQuote_searchButton.isInitialized) {
            this.lookUpQuote_searchButton.initialize();
        }


        if(!this.lookUpQuote_elements.lookUpQuote_Salesman.isInitialized) {
            for(const key in this.lookUpQuote_elements) {
                this.lookUpQuote_elements[key].initialize();
            }


            // Default Salesman Lookup to Current User
            this.lookUpQuote_elements.lookUpQuote_Salesman.domElement.value = this.currentUser;
        }


        if(!this.whoWhat_elements.whoWhat_Salesman.isInitialized) {
            for(const key in this.whoWhat_elements) {
                this.whoWhat_elements[key].initialize();
            }

            // Default Salesman Lookup to Current User
            this.whoWhat_elements.whoWhat_Salesman.domElement.value = this.currentUser;
        }


        if(!this.quote_saveButton.isInitialized) {
            this.quote_saveButton.initialize();
        }

        if(!this.quote_printButton.isInitialized) {
            this.quote_printButton.initialize();
        }

        if(!this.quote_cloneButton.isInitialized) {
            this.quote_cloneButton.initialize();
        }

        if(!this.finances_elements.finances_Chassis_Cost.isInitialized) {
            for(const key in this.finances_elements) {
                this.finances_elements[key].initialize();
            }

            this.finances_elements.finances_Profit_Percent.domElement.value = Math.round(this.finances_elements.finances_Profit_Amount.domElement.value / this.calculateTotalBeforeProfit() * 100, 2);

            this.calculateTotalBeforeProfit();

            this.calculateTotalAfterProfit();
        }


        if(!this.fetCredit_elements.fetCredit_FET_Front_Description.isInitialized) {
            for(const key in this.fetCredit_elements) {
                this.fetCredit_elements[key].initialize();
            }

            // Initialize the Subtotals and Total of F.E.T. Credit
            if(!this.fetCredit_elements.fetCredit_FET_Front_Cost.domElement.value || isNaN(this.fetCredit_elements.fetCredit_FET_Front_Cost.domElement.value)) {
                this.fetCredit_elements.fetCredit_FET_Front_Cost.domElement.value = 0.00;
            }
            if(!this.fetCredit_elements.fetCredit_FET_Front_Quantity.domElement.value || isNaN(this.fetCredit_elements.fetCredit_FET_Front_Quantity.domElement.value)) {
                this.fetCredit_elements.fetCredit_FET_Front_Quantity.domElement.value = 2;
            }

            if(!this.fetCredit_elements.fetCredit_FET_Rear_Cost.domElement.value || isNaN(this.fetCredit_elements.fetCredit_FET_Rear_Cost.domElement.value)) {
                this.fetCredit_elements.fetCredit_FET_Rear_Cost.domElement.value = 0.00;
            }
            if(!this.fetCredit_elements.fetCredit_FET_Rear_Quantity.domElement.value || isNaN(this.fetCredit_elements.fetCredit_FET_Rear_Quantity.domElement.value)) {
                this.fetCredit_elements.fetCredit_FET_Rear_Quantity.domElement.value = 8;
            }

            this.calculateFETTotals();
        }


        if(!this.tradeIn_elements.tradeIn_Make.isInitialized) {
            for(const key in this.tradeIn_elements) {
                this.tradeIn_elements[key].initialize();
            }
        }
    }
}