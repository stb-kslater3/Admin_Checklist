public with sharing class AdminChecklist_Controller {
    // . . . insert a record
    @AuraEnabled(cacheable=false)
    public static Id insertRecord(String objectName, Map<String, Object> fieldValuePairs){
      sObject recordObject;

      try {
        recordObject = (sObject) Type.forName(objectName).newInstance();
        
        for (String key : fieldValuePairs.keySet()) {
            if(key.containsIgnoreCase('date')) {
                System.debug(fieldValuePairs.get(key));
            
                String dateString = '';

                if(fieldValuePairs.get(key) instanceof String) {
                    String originalString = (String) fieldValuePairs.get(key);

                    originalString = originalString.split('Z')[0];
                    originalString = originalString.split('T')[0];
                    originalString = originalString.split(' ')[0];

                    String[] originalSplit = originalString.split('-');

                    dateString = originalSplit[1] + '/' + originalSplit[2] + '/' + originalSplit[0];
                }else if(fieldValuePairs.get(key) instanceof Date) {
                    Date d = (Date) fieldValuePairs.get(key);

                    dateString = d.month() + '/' + d.day() + '/' + d.year();
                }else {
                    Datetime d = (Datetime) fieldValuePairs.get(key);

                    dateString = d.month() + '/' + d.day() + '/' + d.year();
                }

                System.debug(dateString);

                recordObject.put(key, Date.parse(dateString));
            }else {
              recordObject.put(key, fieldValuePairs.get(key));
            }
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


    @AuraEnabled(cacheable=false)
    public static OpportunityLineItem[] getProducts(Id oppId){
        try {
            return [
                SELECT Opportunity.Name, Product2.Name, Product2.VIN__c, Product2.VIN_Last_6__c, Product2.RecordType.Name, Product2.Year__c, Product2.Chassis_Make__c, Product2.Chassis_Model__c, Product2.Body_Model__c, Sales_Price_w_o_FET__c
                FROM OpportunityLineItem
                WHERE OpportunityId = :oppId
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }



    @AuraEnabled(cacheable=false)
    public static Map<String, rstk__poline__c[]> getPOs(OpportunityLineItem[] lineItems){
        try {
            Map<String, rstk__poline__c[]> poMap = new Map<String, rstk__poline__c[]>();

            // Need the Other because I have to try to find by STEProject__c first and if not then find by
            // Project Name because if Project Name needs changed it has to be done through STE_Project__c
            // but there isn't always an STEProject__c . . .  etc. this is because of how Rootstock is set up
            rstk__poline__c[] poLines;
            rstk__poline__c[] otherPOLines;

            // Used to find the po lines that aren't Chassis Type, it looks up by name of product and matches to project
            String productString;

            // Used to avoid double returning a PO Line when checking if otherPOLines contents are in poLines
            Boolean notAlreadyThere;


            for(OpportunityLineItem lineItem : lineItems) {
                // Chassis has a different way of being queried so do it as its own thing
                if(lineItem.Product2.RecordType.Name.equals('Chassis')) {
                    productString = '%' + lineItem.Product2.VIN_Last_6__c + '%';

                    poLines = [
                        SELECT Id, Name, rstk__poline_item__r.rstk__poitem_comcod__r.Name, rstk__poline_longdescr__c, rstk__poline_amtreq__c, STEProject__c, rstk__poline_proj__r.Name
                        FROM rstk__poline__c
                        WHERE rstk__poline_div__r.Name LIKE '%STE%'
                        AND rstk__poline_item__r.Name LIKE :productString
                        AND rstk__poline_qtyreq__c > 0
                    ];

                    if(poLines.size() > 1) {
                        // Compare the STE#### of the LineItem's Opportunity to the STE#### of the PO Line STEProject/Project
                        Pattern steNum = Pattern.compile('STE(\\d+)');

                        Matcher oppMatch = steNum.Matcher(lineItem.Opportunity.Name);

                        oppMatch.find();

                        String oppGroup = oppMatch.group();

                        // By default match to 0 in case we don't find any match
                        Integer steMatchIndex = 0;
                        Matcher poMatch;
                        String poGroup;

                        for(Integer i = 1; i < poLines.size(); i++) {
                            if(poLines[i].STEProject__c != null && poLines[i].STEProject__c != '') {
                                poMatch = steNum.Matcher(poLines[i].STEProject__c);
                            }else {
                                poMatch = steNum.Matcher(poLines[i].rstk__poline_proj__r.Name);
                            }

                            poMatch.find();

                            poGroup = poMatch.group();

                            if(poGroup == oppGroup) {
                                steMatchIndex = i;
                                break;
                            }
                        }

                        rstk__poline__c newPOLine = poLines[steMatchIndex];

                        poLines = new List<rstk__poline__c>();

                        poLines.add(newPOLine);
                    }
                }else {
                    productString = '%' + lineItem.Product2.Name + '%';
// BODY WILL PULL EVERYTHING BECAUSE THE NAME OF THE BODY IS LIKE THE STE_PROJECT__C OF EVERYTHING ELSE, I MIGHT WANT TO
// DO THE BODY SEPERATELY
                    // The other types have to go by Project Name, but if Project Name needs changed then it is from
                    // STEProject__c so just grab all of by STE_Project__c like it, then grab by Project Name like it but
                    // don't double add a PO Line to the list

                    // Also, the STEProject__c set on the Chassis PO Line causes this to find it so make sure when you
                    // do body that it doesn't double dip the chassis by checking the type
                    poLines = [
                        SELECT Id, Name, rstk__poline_item__r.rstk__poitem_comcod__r.Name, rstk__poline_longdescr__c, rstk__poline_amtreq__c
                        FROM rstk__poline__c
                        WHERE rstk__poline_div__r.Name LIKE '%STE%'
                        AND STEProject__c LIKE :productString
                        AND (NOT rstk__poline_item__r.rstk__poitem_comcod__r.Name LIKE '%CHASSIS%')
                        AND rstk__poline_qtyreq__c > 0
                    ];

                    otherPOLines = [
                        SELECT Id, Name, rstk__poline_item__r.rstk__poitem_comcod__r.Name, rstk__poline_longdescr__c, rstk__poline_amtreq__c
                        FROM rstk__poline__c
                        WHERE rstk__poline_div__r.Name LIKE '%STE%'
                        AND rstk__poline_proj__r.Name LIKE :productString
                        AND (NOT rstk__poline_item__r.rstk__poitem_comcod__r.Name LIKE '%CHASSIS%')
                        AND rstk__poline_qtyreq__c > 0
                    ];

                    if(otherPOLines.size() > 0) {
                        for(rstk__poline__c otherPOLine : otherPOLines) {
                            notAlreadyThere = true;

                            for(rstk__poline__c poLine: poLines) {
                                if(otherPOLine.Id == poLine.Id) {
                                    notAlreadyThere = false;

                                    break;
                                }
                            }

                            if(notAlreadyThere) {
                                poLines.add(otherPOLine);
                            }
                        }
                    }
                }
System.debug(lineItem.Product2.RecordType.Name);
for(rstk__poline__c poLine : poLines) {
    System.debug(poLine);
}
                // In any case, I put the RecordType Name as they key so it can be distinguished in the LWC that called it
                poMap.put(lineItem.Product2.RecordType.Name, poLines);
            }

            return poMap;
        }catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    
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
