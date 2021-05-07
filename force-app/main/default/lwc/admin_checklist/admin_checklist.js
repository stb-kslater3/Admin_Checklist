
import { LightningElement, track } from 'lwc';


import { View } from "c/lwc_mvc_prototype2";



export default class Admin_checklist extends LightningElement {
    @track poDynamicList;

    view;


    constructor() {
        super();


        this.view = new View();


        this.poDynamicList = [];

        this.addToPOList('Chassis', 0, '');
        this.addToPOList('Body', 0, '');
        this.addToPOList('Freight', 0, '');
    }


    addToPOList(title, cost, description) {
        this.poDynamicList.push({
            index: this.poDynamicList.length,

            dataIdTitle: 'title_' + this.poDynamicList.length,
            title: title,

            dataIdCost: 'cost_' + this.poDynamicList.length,
            cost: cost,

            dataIdDescription: 'description_' + this.poDynamicList.length,
            description: description
        });
    }

    setInitials_AddPO() {
        this.view.setAttribute('AddPOTitle', 'value', '');
        this.view.setAttribute('AddPOCost', 'value', 0);
        this.view.setAttribute('AddPODescription', 'value', '')
    }

    handleClick_AddPO() {
        this.addToPOList(this.view.getAttribute('AddPOTitle', 'value'), this.view.getAttribute('AddPOCost', 'value'), this.view.getAttribute('AddPODescription', 'value'));

        this.setInitials_AddPO();
    }


    handleClick_RemovePO(event) {
        let poIndex = event.target.getAttribute('data-index');

        this.poDynamicList.splice(poIndex, 1);
    }


    renderedCallback() {
        this.view.updateNodes( this.template.querySelectorAll("[data-track='true']") );
    }
}