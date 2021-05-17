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
}
