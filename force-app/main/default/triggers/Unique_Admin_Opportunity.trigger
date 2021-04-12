trigger Unique_Admin_Opportunity on Opportunity (before insert, before update) {
    for(Opportunity beingSaved : Trigger.new) {
        if(beingSaved.AdminChecklist__c != null) {
            Opportunity[] haveThisAdmin = [
                SELECT Name, Id
                FROM Opportunity
                WHERE AdminChecklist__c = :beingSaved.AdminChecklist__c
            ];

            if(haveThisAdmin.size() > 0) {
                if(haveThisAdmin[0].Id != beingSaved.Id) {
                    beingSaved.addError('Another Opportunity already owns this Admin. Other Opportunity Name/Id: ' + haveThisAdmin[0].Name + '/' + haveThisAdmin[0].Id);
                }
            }
        }
    }
}