import { LightningElement } from 'lwc';

import queryFromString from "@salesforce/apex/Apex_Generic_Prototype.queryFromString";

import { loadScript } from 'lightning/platformResourceLoader';
import AWS_SDK from '@salesforce/resourceUrl/aws_sdk';

import getAWS from '@salesforce/apex/CredentialManager.getAWS';

import { AdminS3 } from 'c/admin_s3';



export default class Admin_snapshots extends LightningElement {
    hasSnapshots;

    snapshots;

    constructor() {
        super();

        this.snapshots = {}
    }
}