public with sharing class SearchIDController {
    
    @AuraEnabled
    public static Object getHolidays(String idInfoData) {
        try {
            System.System.debug(idInfoData);
            IdInfo idInf = (IdInfo)JSON.deserialize(idInfoData, IdInfo.class);
            
            String apiKey = getAPIKey();

            if (apiKey == null) {
                System.System.debug('No apiKey found');
                return null;
            }

            // Creating the API endpoint URL with the API key and query parameters
            String endPoint = 'https://calendarific.com/api/v2/holidays?api_key=' + apiKey + '&country=ZA&year=' + idInf.year;
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endPoint);
            req.setMethod('GET');

            Http http = new Http();
            HttpResponse res = http.send(req);

            // update the search count
            updateSearchCount(idInfoData);
            

            return (Object) JSON.deserializeUntyped(res.getBody());
             
        } catch (Exception ex) {
            // Handle any exceptions
            System.debug('Error calling API: ' + ex.getMessage());
            return null;
        }
    }


    @AuraEnabled
    public static void updateSearchCount(String idInfoData) {
        insertIdInfo(idInfoData);
    }

    @future(callout=false)
    public static void insertIdInfo(String idInff) {
        IdInfo idInfoData = (IdInfo)JSON.deserialize(idInff, IdInfo.class);
        List<ID_Information__c> idNumberInfoList = [SELECT Id, ID_Number__c, Date_of_Birth__c, Gender__c, Citizenship_Status__c, Search_Count__c FROM ID_Information__c WHERE ID_Number__c = :idInfoData.idNumber LIMIT 1];
        ID_Information__c idNumberInfo;
        if(idNumberInfoList.size() > 0) {
            idNumberInfo = idNumberInfoList[0];
        }
        if (idNumberInfo != null) {
            idNumberInfo.Search_Count__c++;
            update idNumberInfo;
        } else {
            ID_Information__c idNumberInfoInsert = new ID_Information__c(ID_Number__c = idInfoData.idNumber, Date_of_Birth__c = Date.valueOf(idInfoData.dateOfBirth), Gender__c = idInfoData.gender, Citizenship_Status__c = idInfoData.citizenshipStatus, Search_Count__c = 1);
            insert idNumberInfoInsert;
        }
    }

    private static String getAPIKey() {
        // Retrieving the API key from the Custom Setting
        CalendarAPIKey__c setting = CalendarAPIKey__c.getInstance();
        if (setting != null && setting.Api_Key__c != null) {
            return setting.Api_Key__c;
        }
        return '';
    }
    
    
    public class IdInfo {
        @AuraEnabled
        public String idNumber;
        @AuraEnabled
        public String dateOfBirth;
        @AuraEnabled
        public String gender;
        @AuraEnabled
        public String citizenshipStatus;
        @AuraEnabled
        public String year;
        

        public IdInfo(String idNumber, String dateOfBirth, String gender, String citizenshipStatus, String year) {
            this.idNumber = idNumber;
            this.dateOfBirth = dateOfBirth;
            this.gender = gender;
            this.citizenshipStatus = citizenshipStatus;
            this.year = year;
        }
    }
}