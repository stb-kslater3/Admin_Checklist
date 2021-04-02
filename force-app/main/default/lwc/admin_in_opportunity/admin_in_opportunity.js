import { LightningElement, track, api } from 'lwc';


import queryFromString from '@salesforce/apex/ApexDataInterface.queryFromString';


export default class Admin_in_opportunity extends LightningElement {
    // Opportunity's record Id set from within the record page by the page itself when loaded
    @api recordId;
    opportunityId;

    opportunityAdminId;

    @track adminLink;

    @track hasSearchResults;
    @track searchResults;
    

    constructor() {
        super();

    }


    searchForAdmins() {
        let adminString =
        'SELECT Name, Name__c, Salesman__r.Name, OpportunityAdmin__r.Name, OpportunityAdmin__r.Name__c, Customer_Name__c, LastModifiedDate, CreatedDate' +
                
        ' FROM AdminChecklist__c' +
        
        ' WHERE OpportunityAdmin__c=\'' + this.opportunityAdminId + '\'';


        queryFromString({ queryString: adminString }).then(records => {
            if(records && records.length > 0) {
                this.hasSearchResults = true;

                this.searchResults = [];

                for(const recordIndex in records) {
                    //console.log(records[recordIndex]);

                    this.searchResults.push({
                        index: recordIndex,

                        id: records[recordIndex].Id,

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


                    if(records[recordIndex].OpportunityAdmin__r.Name__c) {
                        this.searchResults[recordIndex].opportunityAdmin = records[recordIndex].OpportunityAdmin__r.Name__c + ' (' + records[recordIndex].OpportunityAdmin__r.Name + ')';
                    }else {
                        this.searchResults[recordIndex].opportunityAdmin = records[recordIndex].OpportunityAdmin__r.Name;
                    }
                }
            }else {
                this.hasSearchResults = false;
            }
        }).catch(err => {
            console.log(err);
        });
    }


    handleSelection(event) {
        let adminChosen = event.currentTarget.getAttribute('data-id');

        console.log('Admin Selected: ' + adminChosen);

        this.adminLink = 'https://summittruck--rspilot.lightning.force.com/lightning/n/Admin_Checklist?c__AdminChosen=' + adminChosen;
    }


    connectedCallback() {
        if(!this.opportunityId) {
            this.opportunityId = this.recordId;

            let opportunityString = 
                'SELECT OpportunityAdmin__c' +
                
                ' FROM Opportunity' +
                
                ' WHERE Id=\'' + this.opportunityId + '\'';

            queryFromString({ queryString: opportunityString }).then(results => {
                if(results && results.length > 0) {

                    this.opportunityAdminId = results[0].OpportunityAdmin__c;

                    this.searchForAdmins();
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }
}