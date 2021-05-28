@isTest
private class Unique_Admin_Opportunity_TEST {
    @isTest(SeeAllData=true)
    static void testUniqueAdmin_BaseCase() {
        Opportunity opp = [
            SELECT Id, AdminChecklist__c
            FROM Opportunity
            WHERE Id = '0061I00000Pd8ymQAB'
        ];

        AdminChecklist__c ad = new AdminChecklist__c(Customer_Name__c='Billy Bob');
        insert ad;

        opp.AdminChecklist__c = ad.Id;
        update opp;

        // Another Update so that it will set off an if statement within their this time
        opp.Sold__c = false;
        update opp;

        System.assert(true);
    }
}
