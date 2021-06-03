import { LightningElement, track, api } from 'lwc';

import queryFromString from "@salesforce/apex/Apex_Generic_Prototype.queryFromString";


export default class Admin_userpicker extends LightningElement {
    @api value;
    @api disabled;
    
    @track options;

    userpicker;

    haveQueried;

    constructor() {
        super();

        this.options = [];

        this.disabled = false;
    }


    renderedCallback() {
        if(!this.userpicker) {
            this.userpicker = this.template.querySelector("[data-id='Userpicker']");
        }

        if(!this.haveQueried) {
            this.haveQueried = true;

            queryFromString({
                queryString:
                    "SELECT Id, Name" +
                    " FROM User" +
                    " WHERE (Profile.Name = 'Salesuser' OR Name = 'Dan Deaces' OR Name = 'Kaden Slater') AND Name != 'Brad Outersky' AND IsActive = true"
            }).then(data => {
                if(data) {
                    if(data.length > 0) {
                        for(let i = 0; i < data.length; i++) {
                            this.options.push({
                                label: data[i].Name,
    
                                value: data[i].Id
                            });
                        }
    
                        this.userpicker.options = this.options;
                    }else {
                        console.error('No Users found for picklist, data returned has size ' + data.length);
                    }
                }else {
                    console.error('No Users found for picklist, data returned is: ' + data);
                }
            }).catch(err => {
                console.error(err.body ? err.body.message : err.message);
            });
        }
    }


    handleChange() {
        this.value = this.userpicker.value;
    }
}