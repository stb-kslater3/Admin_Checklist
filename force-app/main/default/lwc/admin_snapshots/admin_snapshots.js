import { LightningElement, api } from 'lwc';

import queryFromString from "@salesforce/apex/Apex_Generic_Prototype.queryFromString";

import { loadScript } from 'lightning/platformResourceLoader';
import AWS_SDK from '@salesforce/resourceUrl/aws_sdk';

import { LWC_Toast } from "c/lwc_generic_prototype";

import getAWS from '@salesforce/apex/CredentialManager.getAWS';

import { AdminS3 } from 'c/admin_s3';

import {blobToPDF} from 'c/lwc_blob_handler';



export default class Admin_snapshots extends LightningElement {
    snapshots;

    @api adminId;
    previousId;
    salesmanId;

    awsIsInitialized;

    s3;

    toast;

    constructor() {
        super();

        this.toast = new LWC_Toast(this);
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


    @api
    updateAdminId(newAdminId) {
        this.adminId = newAdminId;

        this.handleAdminChosen();
    }


    handleAdminChosen() {
        queryFromString({
            queryString:
                "SELECT Id, Name, CreatedDate, Salesman__c" +
                " FROM AdminSnapshot__c" + 
                " WHERE AdminChecklist__c='" + this.adminId + "'" +
                " ORDER BY CreatedDate"
        }).then(records => {
            if(records) {
                this.snapshots = [];

                if(records.length > 0) {
                    this.salesmanId = records[0].Salesman__c;

                    for(let i in records) {
                        this.snapshots.push({
                            id: records[i].Id,

                            name: records[i].Name,

                            date: records[i].CreatedDate,

                            index: i
                        });
                    }
                }else {
                    // Needed so that the Render Condition is false and it displays the text no AdminSnapshots found
                    this.snapshots = null;
                    
                    console.log('No AdminSnapshots found, length of records returned is 0');
                }
            }else {
                console.log('No records returned for AdminSnapshots: ' + records);
            }
        }).catch(err => {
            console.error(err.body ? err.body.message : err.message);
        });
    }


    handleSnapshotClicked(event) {
        try {
            let index = event.currentTarget.getAttribute('data-index')
            
            let key = this.salesmanId + '/' + this.adminId + '/' + this.snapshots[index].id + '.pdf';

            this.s3.downloadSnapshot(key).then(data => {
                if(data) {
                    let blob = new Blob([data], {type: 'application/pdf'});

                    let fileName = '';

                    if(this.snapshots[index].name) {
                        fileName += this.snapshots[index].name;
                    }else {
                        fileName += 'Snapshot';
                    }

                    blobToPDF(blob, fileName + '.pdf');   
                }else {
                    console.error('Something went wrong while trying to download blob of Admin Snapshot\'s pdf');
                }
            }).catch(err => {
                console.error('Error while attempting to download Snapshot \n' + (err.body ? err.body.message : err.message));
            });
        }catch(err) {
            console.error('Error while handling the Clicked Snapshot \n' + (err.body ? err.body.message : err.message));
        }
    }


    renderedCallback() {
        if(this.adminId) {
            if(this.adminId !== this.previousId) {
                if(!this.awsIsInitialized) {
                    this.awsIsInitialized = true;
        
                    getAWS().then(credentials => {
                        if(credentials['accessKeyId'] && credentials['secretAccessKey']) {
                            this.initializeAWS(credentials['accessKeyId'], credentials['secretAccessKey']);   
                        }else {
                            this.toast.displayError('Problem with AWS Access Keys');
                        }
                    }).catch(err => {
                        console.error(err.body ? err.body.message : err.message);
                    });
                }


                this.previousId = this.adminId;


                this.handleAdminChosen();
            }
        }
    }
}