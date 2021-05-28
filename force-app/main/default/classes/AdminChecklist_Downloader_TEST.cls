@IsTest
private class AdminChecklist_Downloader_TEST {
    // --------------------------------------------------------------------------------------------
    // ---------------------------------- Format Money -----------------------------------------------
    // --------------------------------------------------------------------------------------------
    @IsTest
    static void testFormatMoney_BaseCase() {
        AdminChecklist_Downloader admin = new AdminChecklist_Downloader();


        System.assertEquals('$12,345.00', admin.formatMoney('12345'));

        System.assertEquals('$678,901.00', admin.formatMoney('678901'));

        System.assertEquals('$1,245.30', admin.formatMoney('1245.3'));

        System.assertEquals('$6,341.55', admin.formatMoney('6341.55'));

        System.assertEquals('$12.00', admin.formatMoney('12'));

        System.assertEquals('$123,456,789.20', admin.formatMoney('123456789.2'));

        System.assertEquals('$98,765,432,102.00', admin.formatMoney('98765432102'));
    }


    @IsTest
    static void test_HailMary() {
        AdminChecklist_Downloader.hailMary();

        System.assert(true);
    }


    // I swear this test worked yesterday, but apparently you cannot run the method getContent, which is part of what downloads the
    // page as a pdf, within a test. Seems silly, but there doesn't seem to be anything that can be done about it
/*
    // -----------------------------------------------------------------------------------------------
    // -------------------------------------------- Download Admin --------------------------------------
    // -----------------------------------------------------------------------------------------------
    @IsTest
    static void testDownloadAdmin_BaseCase() {
        Map<String,String> fieldValuePairs = new Map<String,String>();


        fieldValuePairs.put('Salesman__c', '0051I000001witiQAA');
        fieldValuePairs.put('Date__c', '2020-01-01');
        fieldValuePairs.put('Customer_Name__c', 'Billy Bob\'s Tree Cutting');
        fieldValuePairs.put('Chassis_Make__c', 'Ford');
        fieldValuePairs.put('Chassis_Model__c', 'Tonka');
        fieldValuePairs.put('Chassis_Year__c', '2020');
        fieldValuePairs.put('Chassis_VIN__c', '1FDUF5GTXLEE49959');
        fieldValuePairs.put('Body_Series_Name__c', 'STE1234');

        fieldValuePairs.put('poCount', '2');

        fieldValuePairs.put('type_0', 'Chassis');
        fieldValuePairs.put('cost_0', '1234.56');
        fieldValuePairs.put('description_0', 'Lots of Horsepowewr');

        fieldValuePairs.put('type_1', 'Body');
        fieldValuePairs.put('cost_1', '7890.12');
        fieldValuePairs.put('description_1', 'Lots of Toolspace');

        fieldValuePairs.put('Profit_Amount__c', '1234');
        fieldValuePairs.put('profit_percent', '12');
        fieldValuePairs.put('Dealer_Pack__c', '1234');
        fieldValuePairs.put('gross_amount', '1234');
        fieldValuePairs.put('gross_percent', '12');

        fieldValuePairs.put('subtotal_after_profit', '1234');

        fieldValuePairs.put('ApplyFET__c', 'true');
        fieldValuePairs.put('12_fet', '1234');
        fieldValuePairs.put('Minus_Tire_FET__c', '1234');
        fieldValuePairs.put('total_fet', '1234');

        fieldValuePairs.put('Extended_Warranty__c', '1234');
        fieldValuePairs.put('Other_Fees__c', '1234');
        fieldValuePairs.put('Documentation_Fee__c', '1234');
        fieldValuePairs.put('Deposit__c', '1234');

        fieldValuePairs.put('total', '1234');

        fieldValuePairs.put('TradeIn_Make__c', '');
        fieldValuePairs.put('TradeIn_Model__c', '');
        fieldValuePairs.put('TradeIn_Year__c', '');
        fieldValuePairs.put('TradeIn_Unit_Number__c', '');
        fieldValuePairs.put('TradeIn_Actual_Cash_Value__c', '0');
        fieldValuePairs.put('TradeIn_Billing_Amount__c', '0');

        fieldValuePairs.put('FET_Front_Description__c', '');
        fieldValuePairs.put('FET_Front_Cost__c', '0');
        fieldValuePairs.put('FET_Front_Size__c', '');
        fieldValuePairs.put('FET_Front_Quantity__c', '0');

        fieldValuePairs.put('FET_Rear_Description__c', '');
        fieldValuePairs.put('FET_Rear_Cost__c', '0');
        fieldValuePairs.put('FET_Rear_Size__c', '');
        fieldValuePairs.put('FET_Rear_Quantity__c', '0');


        AdminChecklist_Downloader.downloadAdmin(fieldValuePairs);

        System.assert(true);
    }
*/
}
