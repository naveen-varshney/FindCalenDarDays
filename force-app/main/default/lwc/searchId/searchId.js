import { LightningElement, track } from 'lwc';
import getHolidays from '@salesforce/apex/SearchIDController.getHolidays';
//import { validateIdNumber, extractYearFromId } from './searchIdHelper';

export default class SearchId extends LightningElement {
    
    @track idNumber = '';
    @track holidays = [];
    @track disableSearch = true;
    @track error = '';
    @track year = '';
    @track isValidIdNumber = false;
    @track hasSearched = false;
    @track isLoading = false;
    @track idInfo = {};

    handleIdNumberChange(event) {

        console.log('handleIdNumberChange');

        this.idNumber = event.target.value;
        console.log('idNumber :',this.idNumber );
        this.isValidIdNumber = this.validateIdNumber(this.idNumber);
        console.log('isValidIdNumber :',this.isValidIdNumber );
        this.year = this.isValidIdNumber ? this.year : '';
        console.log('this.year :',this.year);
        this.disableSearch = !this.isValidIdNumber || !this.year;
        this.error = this.isValidIdNumber ? '' : 'Please enter a valid South African ID number.';
        
    }  

    handleSearchClick() {
        this.isLoading = true;
        getHolidays({ idInfoData: JSON.stringify(this.idInfo) })
            .then(apiResponse => {
                console.log('apiresponse' + JSON.stringify(apiResponse));
                this.holidays = [];
                this.hasSearched = true;
                this.isLoading = false;
                if (apiResponse && apiResponse.meta && apiResponse.meta.code === 200 && apiResponse.response && apiResponse.response.holidays) {

                    apiResponse.response.holidays.forEach(holiday => {
                        this.holidays.push({
                            name: holiday.name,
                            description: holiday.description,
                            date: holiday.date.iso,
                            type: holiday.type[0]
                        });
                    });
                    this.error = '';
                }
            })
            .catch(error => {
                console.error('Error calling getHolidays:', error);
                this.holidays = [];
                this.error = 'Error occurred while fetching holidays.';
            });
    }


    get columns() {
        return [
            { label: 'Date', fieldName: 'date', type: 'date' },
            { label: 'Name', fieldName: 'name', type: 'text' },
            { label: 'Type', fieldName: 'type', type: 'text' },
            { label: 'Description', fieldName: 'description', type: 'text' }
        ];
    }

    get fYear() {
        return this.idInfo.year;
    }

    get showHolidays() {
        return this.holidays.length > 0 && this.hasSearched;
    }

    get showNoResults() {
        return this.holidays.length === 0 && this.hasSearched;
    }


    validateIdNumber(idNumber) {
        
        this.idInfo = {};
        // Check if the ID number is a 13-digit number
        if (idNumber.length !== 13 || isNaN(idNumber)) {
            return false;
        }
    
        // Extract the date of birth digits (YYMMDD)
        var dateOfBirthDigits = idNumber.substr(0, 6);
    
        // Extract the gender digits (SSSS)
        var genderDigits = idNumber.substr(6, 4);
    
        // Extract the citizenship status digit (C)
        var citizenshipStatusDigit = idNumber.substr(10, 1);
    
        // Extract the checksum digit (Z)
        var checksumDigit = idNumber.substr(12, 1);


    
        // Validate the date of birth digits
        // Validate the date of birth digits
        var year = parseInt(dateOfBirthDigits.substr(0, 2));
        var month = parseInt(dateOfBirthDigits.substr(2, 2));
        var day = parseInt(dateOfBirthDigits.substr(4, 2));
        var currentYear = new Date().getFullYear() % 100;
        var yearPrefix = (year > currentYear) ? "19" : "20";
        this.year = yearPrefix + year.toString().padStart(2, "0");
        console.log('this.year', this.year);
        var dobString = yearPrefix + year.toString().padStart(2, "0") + month.toString().padStart(2, "0") + day.toString().padStart(2, "0");
        var dobStr = yearPrefix + year.toString().padStart(2, "0") + '-' + month.toString().padStart(2, "0") + '-' + day.toString().padStart(2, "0");
        console.log('dobStr',dobStr);
        console.log('dobString:',dobString);
        var dob = new Date(dobString);
        if (month < 1 || month > 12 || day < 1 || day > 31 || dob > new Date()) {
            console.log('dobString issue:',dobString);
            return false;
        }
    
        // Validate the gender digits
        var gender = parseInt(genderDigits);
        if (gender < 0 || gender > 9999) {
            return false;
        }
    
        // Validate the citizenship status digit
        var citizenshipStatus = parseInt(citizenshipStatusDigit);
        if (citizenshipStatus !== 0 && citizenshipStatus !== 1) {
            return false;
        }

        const payload =  {
            "idNumber" : this.idNumber,
            "dateOfBirth" : dobStr,
            "gender" : genderDigits,
            "citizenshipStatus" : citizenshipStatusDigit,
            "year" : this.year
            
        };
        console.log('payload --',payload);
        this.idInfo = payload;
        console.log('this.idInfo --',this.idInfo);

        /*// Calculate the Luhn checksum
        var checksum = 0;
        var even = false;
        for (var i = 0; i < 12; i++) {
            var digit = parseInt(idNumber.charAt(i));
            if (even) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            checksum += digit;
            even = !even;
        }
        checksum = (10 - (checksum % 10)) % 10;

        // Validate the checksum digit
        if (parseInt(checksumDigit) !== checksum) {
            console.log('checksumDigit:',checksumDigit);
            console.log('checksum:',checksum);
            return false;
        }*/
    
        // All validation checks passed, ID number is valid
        return true;
    }
    

    
}