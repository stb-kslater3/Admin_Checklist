@IsTest
private class AdminChecklist_Controller_TEST {
    // --------------------------------------------------------------------------------------------
    // ---------------------------------- Format Money -----------------------------------------------
    // --------------------------------------------------------------------------------------------
    @IsTest
    static void testFormatMoney_BaseCase() {
        AdminChecklist_Controller admin = new AdminChecklist_Controller();


        System.assertEquals('$12,345.00', admin.formatMoney('12345'));

        System.assertEquals('$678,901.00', admin.formatMoney('678901'));

        System.assertEquals('$1,245.30', admin.formatMoney('1245.3'));

        System.assertEquals('$6,341.55', admin.formatMoney('6341.55'));

        System.assertEquals('$12.00', admin.formatMoney('12'));

        System.assertEquals('$123,456,789.20', admin.formatMoney('123456789.2'));

        System.assertEquals('$98,765,432,102.00', admin.formatMoney('98765432102'));
    }



    // -----------------------------------------------------------------------------------------------
    // -------------------------------------------- Insert Record --------------------------------------
    // -----------------------------------------------------------------------------------------------
    @IsTest
    static void testInsertRecord_BaseCase() {
        Id isInserted = AdminChecklist_Controller.insertRecord('AdminChecklist__c', new Map<String, Object> {'Customer_Name__c'=> 'Evergy', 'Date__c'=> '2021-04-01'});

      System.assert(isInserted != null);
    }



    // -----------------------------------------------------------------------------------------------
    // -------------------------------------------- Download Admin --------------------------------------
    // -----------------------------------------------------------------------------------------------
    @IsTest
    static void testDownloadAdmin_BaseCase() {
        // Not Testable, not that it really needed a test anyway, but apparently test methods do not support the
        // method get content so coverage will not be applied here. Really it is pointless to have this method, but
        // I will keep it here in case I forget

        System.assert(true);
    }



    // -----------------------------------------------------------------------------------------------
    // -------------------------------------------- Get Products --------------------------------------
    // -----------------------------------------------------------------------------------------------
    @IsTest
    static void testGetProducts_BaseCase() {
        System.assert(false);
    }



    // -----------------------------------------------------------------------------------------------
    // -------------------------------------------- Get POs --------------------------------------
    // -----------------------------------------------------------------------------------------------
    @IsTest
    static void testGetPOs_BaseCase() {
        System.assert(false);
    }
}
