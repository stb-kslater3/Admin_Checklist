@IsTest
private class AdminChecklist_Controller_TEST {
    // --------------------------------------------------------------------------------------------
    // ---------------------------------- Format Money -----------------------------------------------
    // --------------------------------------------------------------------------------------------
/*
    @IsTest
    static void 

    
    String[] testNums = new String[] {'12345', '678901', '1245.3', '6341.55', '12', '123456789.2', '98765432102'};

    String[] numSplit;

    String wholePart;
    String changePart;

    String moneyString;

    for(Integer t = 0; t < testNums.size(); t++) {
        numSplit = testNums[t].split('\\.');

        wholePart = numSplit[0];
        
        changePart = '';
        
        if(numSplit.size() > 1) {
            if(numSplit[1].length() == 2) {
                changePart = numSplit[1];
            }else {
                changePart = numSplit[1] + '0';
            }
        }else {
            changePart = '00';
        }
        
        moneyString = '';
        
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
        
        System.debug('Before: ' + testNums[t]);
        System.debug('After: ' + moneyString);  
        System.debug(' ');
    }


*/    
}
