public with sharing class AdminChecklist_Controller {
    public static Map<String, String> adminData {get;set;}


    public String salesman {get; set;}

    public String customer {get; set;}

    public String last_modified {get; set;}

    public String chassis_make {get; set;}

    public String chassis_model {get; set;}

    public String chassis_year {get; set;}

    public String chassis_vin {get; set;}


    public String po1_cost {get; set;}
    public String po1_description {get; set;}

    public String po2_cost {get; set;}
    public String po2_description {get; set;}

    public String po3_cost {get; set;}
    public String po3_description {get; set;}

    public String po4_cost {get; set;}
    public String po4_description {get; set;}

    public String po5_cost {get; set;}
    public String po5_description {get; set;}

    public String po6_cost {get; set;}
    public String po6_description {get; set;}

    public String po7_cost {get; set;}
    public String po7_description {get; set;}

    public String po8_cost {get; set;}
    public String po8_description {get; set;}

    public String po9_cost {get; set;}
    public String po9_description {get; set;}

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


    public AdminChecklist_Controller() {
        Map<String, String> adminData = new Map<String, String>();
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


        if(thisAdmin != null) {
            salesman = thisAdmin.Salesman__r.Name;
            last_modified = thisAdmin.LastModifiedDate.format('y-M-d');
        }else {
            salesman = '_';
            last_modified = '_';
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


        
        if(adminData.containsKey('PO1_Cost__c')) {
            po1_cost = this.formatMoney(adminData.get('PO1_Cost__c'));
        }else {
            po1_cost = '_';
        }
        
        if(adminData.containsKey('PO1_Description__c')) {
            po1_description = adminData.get('PO1_Description__c');
        }else {
            po1_description = '_';
        }
        
        
        if(adminData.containsKey('PO2_Cost__c')) {
            po2_cost = this.formatMoney(adminData.get('PO2_Cost__c'));
        }else {
            po2_cost = '_';
        }
        
        if(adminData.containsKey('PO2_Description__c')) {
            po2_description = adminData.get('PO2_Description__c');
        }else {
            po2_description = '_';
        }

        
        if(adminData.containsKey('PO3_Cost__c')) {
            po3_cost = this.formatMoney(adminData.get('PO3_Cost__c'));
        }else {
            po3_cost = '_';
        }
        
        if(adminData.containsKey('PO3_Description__c')) {
            po3_description = adminData.get('PO3_Description__c');
        }else {
            po3_description = '_';
        }

        
        if(adminData.containsKey('PO4_Cost__c')) {
            po4_cost = this.formatMoney(adminData.get('PO4_Cost__c'));
        }else {
            po4_cost = '_';
        }
        
        if(adminData.containsKey('PO4_Description__c')) {
            po4_description = adminData.get('PO4_Description__c');
        }else {
            po4_description = '_';
        }

        
        if(adminData.containsKey('PO5_Cost__c')) {
            po5_cost = this.formatMoney(adminData.get('PO5_Cost__c'));
        }else {
            po5_cost = '_';
        }
        
        if(adminData.containsKey('PO5_Description__c')) {
            po5_description = adminData.get('PO5_Description__c');
        }else {
            po5_description = '_';
        }

        
        if(adminData.containsKey('PO6_Cost__c')) {
            po6_cost = this.formatMoney(adminData.get('PO6_Cost__c'));
        }else {
            po6_cost = '_';
        }
        
        if(adminData.containsKey('PO6_Description__c')) {
            po6_description = adminData.get('PO6_Description__c');
        }else {
            po6_description = '_';
        }

        
        if(adminData.containsKey('PO7_Cost__c')) {
            po7_cost = this.formatMoney(adminData.get('PO7_Cost__c'));
        }else {
            po7_cost = '_';
        }
        
        if(adminData.containsKey('PO7_Description__c')) {
            po7_description = adminData.get('PO7_Description__c');
        }else {
            po7_description = '_';
        }

        
        if(adminData.containsKey('PO8_Cost__c')) {
            po8_cost = this.formatMoney(adminData.get('PO8_Cost__c'));
        }else {
            po8_cost = '_';
        }
        
        if(adminData.containsKey('PO8_Description__c')) {
            po8_description = adminData.get('PO8_Description__c');
        }else {
            po8_description = '_';
        }

        
        if(adminData.containsKey('PO9_Cost__c')) {
            po9_cost = this.formatMoney(adminData.get('PO9_Cost__c'));
        }else {
            po9_cost = '_';
        }
        
        if(adminData.containsKey('PO9_Description__c')) {
            po9_description = adminData.get('PO9_Description__c');
        }else {
            po9_description = '_';
        }


        if(adminData.containsKey('subtotal_before_profit')) {
            subtotal_before_profit = this.formatMoney(adminData.get('subtotal_before_profit'));   
        }else {
            subtotal_before_profit = '_';
        }


        if(adminData.containsKey('Profit_Amount__c')) {
            profit_amount = this.formatMoney(adminData.get('Profit_Amount__c'));
        }else {
            profit_amount = '_';
        }


        if(adminData.containsKey('profit_percent')) {
            profit_percent = adminData.get('profit_percent') + '%';   
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
            gross_after_com_percent = adminData.get('gross_percent') + '%';
        }else {
            gross_after_com_percent = '_';
        }


        if(adminData.containsKey('subtotal_after_profit')) {
            subtotal_after_profit = this.formatMoney(adminData.get('subtotal_after_profit'));
        }else {
            subtotal_after_profit = '_';
        }


        if(adminData.containsKey('apply_fet')) {
            fet_applies = adminData.get('apply_fet');
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



    @AuraEnabled(cacheable=false)
    public static Id createAdminGroup(){
        try {
            OpportunityAdmin__c adminGroup = new OpportunityAdmin__c();

            Database.SaveResult result = Database.insert(adminGroup, true);

            if(result.isSuccess()) {
                return result.getId();                
            }

            return null;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // . . . insert a record
    @AuraEnabled(cacheable=false)
    public static Id insertRecord(String objectName, Map<String, Object> fieldValuePairs){
      sObject recordObject;

      try {
        recordObject = (sObject) Type.forName(objectName).newInstance();
        
        for (String key : fieldValuePairs.keySet()) {
          recordObject.put(key, fieldValuePairs.get(key));
        }
       
        Database.SaveResult result = Database.insert(recordObject, true);
        
        if (result.isSuccess()) {
            return result.getId();
        }

        return null;
      } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
      }
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
}
