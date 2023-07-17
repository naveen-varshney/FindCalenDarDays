@isTest
public class SearchIDControllerTest {
    @isTest
    static void testGetHolidays() {
        // Create a test API response
        HttpResponse mockedResponse = new HttpResponse();
        mockedResponse.setBody('{"meta":{"code":200},"response":{"holidays":[{"name":"Holiday 1","description":"Description 1","date":{"iso":"2023-12-25"},"type":["Type 1"]}]}}');
        mockedResponse.setStatusCode(200);
        
        // Mock the HTTP callout
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator(mockedResponse));
        
        // Create test data
        ID_Information__c idNumberInfo = new ID_Information__c(ID_Number__c = '1234567890123', Date_of_Birth__c = Date.newInstance(1990, 1, 1), Gender__c = 'Male', Citizenship_Status__c = 'Citizen', Search_Count__c = 0);
        insert idNumberInfo;
        
        // Call the getHolidays method
        SearchIDController.IdInfo idInfo = new SearchIDController.IdInfo('1234567890123', '1990-01-01', 'Male', 'Citizen', '2023');
        String idInfoData = JSON.serialize(idInfo);
        Object result = SearchIDController.getHolidays(idInfoData);
        
        // Verify the response
        Map<String, Object> response = (Map<String, Object>)JSON.deserializeUntyped((String)result);
        System.assertEquals(200, (Integer)((Map<String, Object>)response.get('meta')).get('code'));
        List<Object> holidays = (List<Object>)((Map<String, Object>)response.get('response')).get('holidays');
        System.assertEquals(1, holidays.size());
        Map<String, Object> holiday = (Map<String, Object>)holidays[0];
        System.assertEquals('Holiday 1', holiday.get('name'));
        System.assertEquals('Description 1', holiday.get('description'));
        System.assertEquals('2023-12-25', ((Map<String, Object>)holiday.get('date')).get('iso'));
        List<String> types = (List<String>)holiday.get('type');
        System.assertEquals(1, types.size());
        System.assertEquals('Type 1', types[0]);
        
        // Verify the search count has been updated
        ID_Information__c updatedIdNumberInfo = [SELECT Search_Count__c FROM ID_Information__c WHERE Id = :idNumberInfo.Id];
        System.assertEquals(1, updatedIdNumberInfo.Search_Count__c);
    }
    
    // Mock HTTP callout response generator
    public class MockHttpResponseGenerator implements HttpCalloutMock {
        private HttpResponse response;
        
        public MockHttpResponseGenerator(HttpResponse response) {
            this.response = response;
        }
        
        public HttpResponse respond(HttpRequest request) {
            return this.response;
        }
    }
}
