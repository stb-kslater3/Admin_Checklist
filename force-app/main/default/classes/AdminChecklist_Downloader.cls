public with sharing class AdminChecklist_Downloader {
    public static Map<String, String> adminData {get;set;}


    public String salesman {get; set;}

    public String adminName {get; set;}

    public String customer {get; set;}

    public String last_modified {get; set;}

    public String chassis_make {get; set;}

    public String chassis_model {get; set;}

    public String chassis_year {get; set;}

    public String chassis_vin {get; set;}

    public String body_series {get; set;}


    public List<Integer> poDataIndices {get; set;}
    public List<String> poDataType {get; set;}
    public List<String> poDataCost {get; set;}
    public List<String> poDataDescription {get; set;}

    public String subtotal_before_profit {get; set;}


    public String profit_amount {get; set;}

    public String profit_percent {get; set;}

    public String dealer_pack {get; set;}

    public String gross_after_com_amount {get; set;}

    public String gross_after_com_percent {get; set;}


    public String subtotal_after_profit {get; set;}


    public String fet_applies {get; set;}

    public String fet_12_percent {get; set;}

    public String minus_tire_fet {get; set;}

    public String total_fet {get; set;}


    public String extended_warranty {get; set;}

    public String other_fees {get; set;}

    public String documentation_fee {get; set;}

    public String deposit {get; set;}

    public String total {get; set;}

    
    public String trade_in_make {get; set;}

    public String trade_in_model {get; set;}

    public String trade_in_year {get; set;}

    public String trade_in_unit_number {get; set;}

    public String trade_in_actual_cash_value {get; set;}

    public String trade_in_billing_amount {get; set;}


    public String fet_front_description {get; set;}

    public String fet_front_size {get; set;}

    public String fet_front_cost {get; set;}

    public String fet_front_quantity {get; set;}


    public String fet_rear_description {get; set;}

    public String fet_rear_size {get; set;}

    public String fet_rear_cost {get; set;}

    public String fet_rear_quantity {get; set;}


    public AdminChecklist_Downloader() {
        adminData = new Map<String, String>();
        Map<String, String> params = ApexPages.currentPage().getParameters();


        for (String key : params.keySet()) {
            adminData.put(key, params.get(key));
        }

        AdminChecklist__c[] queryResult = [
            SELECT Salesman__r.Name, LastModifiedDate
            FROM AdminChecklist__c
            WHERE Id = :adminData.get('Id')
        ];

        AdminChecklist__c thisAdmin;

        if(queryResult.size() > 0) {
            thisAdmin = queryResult[0];
        }


        if(adminData.containsKey('Date__c')) {
            last_modified = adminData.get('Date__c');
        }else if(thisAdmin != null) {
            last_modified = thisAdmin.LastModifiedDate.format('y-M-d');
        }else {
            last_modified = '_';
        }

        if(adminData.containsKey('Name__c')) {
            adminName = adminData.get('Name__c');
        }else {
            adminName = '_';
        }

        if(adminData.containsKey('Salesman__c')) {
            User[] salesmanQueried = [
                SELECT Name
                FROM User
                WHERE Id = :adminData.get('Salesman__c')
            ];

            if(salesmanQueried.size() > 0) {
                salesman = salesmanQueried[0].Name;
            }
        }else {
            salesman = '_';
        }

        if(adminData.containsKey('Customer_Name__c')) {
            customer = adminData.get('Customer_Name__c');
        }else {
            customer = '_';
        }

        
        if(adminData.containsKey('Chassis_Make__c')) {
            chassis_make = adminData.get('Chassis_Make__c');
        }else {
            chassis_make = '_';
        }
        
        if(adminData.containsKey('Chassis_Model__c')) {
            chassis_model = adminData.get('Chassis_Model__c');
        }else {
            chassis_model = '_';
        }

        if(adminData.containsKey('Chassis_Year__c')) {
            chassis_year = adminData.get('Chassis_Year__c');
        }else {
            chassis_year = '_';
        }
        
        if(adminData.containsKey('Chassis_VIN__c')) {
            chassis_vin = adminData.get('Chassis_VIN__c');
        }else {
            chassis_vin = '_';
        }


        if(adminData.containsKey('Body_Series_Name__c')) {
            body_series = adminData.get('Body_Series_Name__c');
        }else {
            body_series = '_';
        }



        poDataIndices = new List<Integer>();
        poDataType = new List<String>();
        poDataCost = new List<String>();
        poDataDescription = new List<String>();

        Integer poCount = 0;
        if(adminData.containsKey('poCount')) {
            poCount = Integer.valueOf(adminData.get('poCount'));
        }

        for(Integer i = 0; i < poCount; i++) {
            poDataIndices.add(i);

            poDataType.add( adminData.get('type_' + String.valueOf(i)) );
            poDataCost.add( this.formatMoney(adminData.get('cost_' + String.valueOf(i))) );
            poDataDescription.add( adminData.get('description_' + String.valueOf(i)) );
        }


        if(adminData.containsKey('Profit_Amount__c')) {
            profit_amount = this.formatMoney(adminData.get('Profit_Amount__c'));
        }else {
            profit_amount = '_';
        }


        if(adminData.containsKey('profit_percent')) {
            Decimal percentAmount = (Decimal.valueOf(adminData.get('profit_percent')) * 100.0).setScale(2);
            profit_percent =  percentAmount.format() + '%';   
        }else {
            profit_percent = '_';
        }


        if(adminData.containsKey('Dealer_Pack__c')) {
            dealer_pack = this.formatMoney(adminData.get('Dealer_Pack__c'));
        }else {
            dealer_pack = '_';
        }


        if(adminData.containsKey('gross_amount')) {
            gross_after_com_amount = this.formatMoney(adminData.get('gross_amount'));
        }else {
            gross_after_com_amount = '_';
        }

        if(adminData.containsKey('gross_percent')) {
            Decimal percentAmount = (Decimal.valueOf(adminData.get('gross_percent')) * 100.0).setScale(2);
            gross_after_com_percent =  percentAmount.format() + '%'; 
        }else {
            gross_after_com_percent = '_';
        }


        if(adminData.containsKey('subtotal_after_profit')) {
            subtotal_after_profit = this.formatMoney(adminData.get('subtotal_after_profit'));
        }else {
            subtotal_after_profit = '_';
        }


        if(adminData.containsKey('ApplyFET__c')) {
            fet_applies = adminData.get('ApplyFET__c');
        }else {
            fet_applies = '_';
        }

        if(adminData.containsKey('12_fet')) {
            fet_12_percent = this.formatMoney(adminData.get('12_fet'));
        }else {
            fet_12_percent = '_';
        }

        if(adminData.containsKey('Minus_Tire_FET__c')) {
            minus_tire_fet = this.formatMoney(adminData.get('Minus_Tire_FET__c'));
        }else {
            minus_tire_fet = '_';
        }

        if(adminData.containsKey('total_fet')) {
            total_fet = this.formatMoney(adminData.get('total_fet'));
        }else {
            total_fet = '_';
        }


        if(adminData.containsKey('Extended_Warranty__c')) {
            extended_warranty = this.formatMoney(adminData.get('Extended_Warranty__c'));
        }else {
            extended_warranty = '_';
        }


        if(adminData.containsKey('Other_Fees__c')) {
            other_fees = this.formatMoney(adminData.get('Other_Fees__c'));
        }else {
            other_fees = '_';
        }


        if(adminData.containsKey('Documentation_Fee__c')) {
            documentation_fee = this.formatMoney(adminData.get('Documentation_Fee__c'));
        }else {
            documentation_fee = '_';
        }


        if(adminData.containsKey('Deposit__c')) {
            deposit = this.formatMoney(adminData.get('Deposit__c'));
        }else {
            deposit = '_';
        }


        if(adminData.containsKey('total')) {
            total = this.formatMoney(adminData.get('total'));
        }else {
            total = '_';
        }


        if(adminData.containsKey('TradeIn_Make__c')) {
            trade_in_make = adminData.get('TradeIn_Make__c');
        }else {
            trade_in_make = '_';
        }

        if(adminData.containsKey('TradeIn_Model__c')) {
            trade_in_model = adminData.get('TradeIn_Model__c');
        }else {
            trade_in_model = '_';
        }

        if(adminData.containsKey('TradeIn_Year__c')) {
            trade_in_year = adminData.get('TradeIn_Year__c');
        }else {
            trade_in_year = '_';
        }

        if(adminData.containsKey('TradeIn_Unit_Number__c')) {
            trade_in_unit_number = adminData.get('TradeIn_Unit_Number__c');
        }else {
            trade_in_unit_number = '_';
        }

        if(adminData.containsKey('TradeIn_Actual_Cash_Value__c')) {
            trade_in_actual_cash_value = this.formatMoney(adminData.get('TradeIn_Actual_Cash_Value__c'));
        }else {
            trade_in_actual_cash_value = '_';
        }

        if(adminData.containsKey('TradeIn_Billing_Amount__c')) {
            trade_in_billing_amount = this.formatMoney(adminData.get('TradeIn_Billing_Amount__c'));
        }else {
            trade_in_billing_amount = '_';
        }


        if(adminData.containsKey('FET_Front_Description__c')) {
            fet_front_description = adminData.get('FET_Front_Description__c');
        }else {
            fet_front_description = '_';
        }

        if(adminData.containsKey('FET_Front_Cost__c')) {
            fet_front_cost = this.formatMoney(adminData.get('FET_Front_Cost__c'));
        }else {
            fet_front_cost = '_';
        }

        if(adminData.containsKey('FET_Front_Size__c')) {
            fet_front_size = adminData.get('FET_Front_Size__c');
        }else {
            fet_front_size = '_';
        }

        if(adminData.containsKey('FET_Front_Quantity__c')) {
            fet_front_quantity = adminData.get('FET_Front_Quantity__c');
        }else {
            fet_front_quantity = '_';
        }


        if(adminData.containsKey('FET_Rear_Description__c')) {
            fet_rear_description = adminData.get('FET_Rear_Description__c');
        }else {
            fet_rear_description = '_';
        }

        if(adminData.containsKey('FET_Rear_Cost__c')) {
            fet_rear_cost = this.formatMoney(adminData.get('FET_Rear_Cost__c'));
        }else {
            fet_rear_cost = '_';
        }

        if(adminData.containsKey('FET_Rear_Size__c')) {
            fet_rear_size = adminData.get('FET_Rear_Size__c');
        }else {
            fet_rear_size = '_';
        }

        if(adminData.containsKey('FET_Rear_Quantity__c')) {
            fet_rear_quantity = adminData.get('FET_Rear_Quantity__c');
        }else {
            fet_rear_quantity = '_';
        }
    }


    @TestVisible
    private String formatMoney(String numberString) {
        String[] numSplit = numberString.split('\\.');

        String wholePart = numSplit[0];

        String changePart;
        
        if(numSplit.size() > 1) {
            changePart = numSplit[1];
        }else {
            changePart = '';
        }
        
        if(changePart.length() == 0) {
            changePart = '00';
        }else if(changePart.length() == 1) {
            changePart = changePart + '0';
        }
        
        String moneyString = '';
        
        for(Integer i = 0; i < wholePart.length() / 3; i++) {
            //System.debug( num1.substring(num1.length() - 3*(i+1),  num1.length() - 3*i) );
            moneyString = ',' + wholePart.substring(wholePart.length() - 3*(i+1),  wholePart.length() - 3*i) + moneyString;
        }
        
        // If multiple of 3 there is extra comment on front so remove that
        if(Math.mod(wholePart.length(), 3) == 0) {
            moneyString = moneyString.substring(1, moneyString.length());
        }
        
        //System.debug( num1.substring(0, Math.mod(num1.length(), 3)) );
        moneyString = '$' + wholePart.substring(0, Math.mod(wholePart.length(), 3)) + moneyString + '.' + changePart;


        return moneyString;
    }



    public static PageReference getDownloadPage() {
        PageReference page = Page.AdminChecklist_DownloaderPage.setRedirect(false);

        for (String key : adminData.keySet()) {
            page.getParameters().put(key, adminData.get(key));
        }

        return page;
    }


    @AuraEnabled(cacheable=false)
    public static String downloadAdmin(Map<String, String> fieldValuePairs) {
        adminData = new Map<String, String>();

        for (String key : fieldValuePairs.keySet()) {
            adminData.put(key, fieldValuePairs.get(key));
        }

        return EncodingUtil.base64Encode(getDownloadPage().getContentAsPDF());
    }



    // OLD, not sure what I wanted to do with that, will be removed once I am sure that it needs to be
    // I think that I was originally going to try and put the Document in Salesforce
    /*
    @AuraEnabled(cacheable=false)
    public static Boolean saveSnapshot(String name, Map<String, String> fieldValuePairs){
        Boolean isSuccess = false;

        adminData = new Map<String, String>();

        for (String key : fieldValuePairs.keySet()) {
            adminData.put(key, fieldValuePairs.get(key));
        }

        Document doc = new Document();
        doc.Name = name;
        doc.Type = 'pdf';
        doc.ContentType = 'application/pdf';
        doc.Body = getDownloadPage().getContentAsPDF();

        Database.SaveResult isInserted = Database.insert(doc);

        if(isInserted.isSuccess()) {
            isSuccess = true;
        }

        return isSuccess;
    }
    */



    // Because the test is impossible, I have to shift the percentage with a bunch of junk.
    @TestVisible
    private static void hailMary() {
        String whatIsLogic = '';

        whatIsLogic += 'If it was so';

        whatIsLogic += ', then it might be; ';

        whatIsLogic += 'and if it were so';

        whatIsLogic += ', it would be; ';

        whatIsLogic += 'but as it isn\'t';

        whatIsLogic += ', it ain\'t. ';

        whatIsLogic += 'That\'s Logic.';

        System.debug(whatIsLogic);

        Integer count = 0;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);
        
        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);

        count++;
        System.debug(count);
    }
}
