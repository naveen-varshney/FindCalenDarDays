export function validateIdNumber(idNumber) {
    // Check if the ID number is a valid length
    if (idNumber.length !== 13) {
        return false;
    }

    // Check if the ID number consists of numeric characters only
    if (!/^\d+$/.test(idNumber)) {
        return false;
    }

    // Extract the date of birth from the ID number
    const dateOfBirth = idNumber.substring(0, 6);

    // Check if the date of birth is a valid date
    const year = Number('19' + dateOfBirth.substring(0, 2));
    const month = Number(dateOfBirth.substring(2, 4));
    const day = Number(dateOfBirth.substring(4, 6));
    const dob = new Date(year, month - 1, day);
    if (isNaN(dob.getTime())) {
        console.log('dob not real');
        return false;
    }

    // Check if the gender digits are in the valid range
    const genderDigits = Number(idNumber.substring(6, 10));
    if ((genderDigits < 0 || genderDigits > 4999) && (genderDigits < 5000 || genderDigits > 9999)) {
        console.log('genderdigits',genderDigits);
        return false;
    }

    // Check if the citizenship indicator is valid
    const citizenship = Number(idNumber.charAt(10));
    if (citizenship !== 0 && citizenship !== 1) {
        console.log('citizenship:',citizenship);
        return false;
    }

    // Check the checksum using the Luhn algorithm
    const checkDigit = Number(idNumber.charAt(12));
    const idWithoutCheckDigit = idNumber.substring(0, 12);
    const checksum = calculateLuhnChecksum(idWithoutCheckDigit);
    if (checkDigit !== checksum) {
        console.log('checkDigit:',checkDigit);
        console.log('checksum:',checksum);
        return false;
    }

    return true;
}

export function extractYearFromId(idNumber) {
    const year = Number('19' + idNumber.substring(0, 2));
    /*const yearDigits = idNumber.substr(0, 2);
    const currentYear = new Date().getFullYear();
    //taking the current century 
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const year = parseInt(yearDigits) + currentCentury;
    console.log(extractYearFromId,year);*/
    return year.toString();
}



function calculateLuhnChecksum(value) {
    let sum = 0;
    let alt = false;
    for (let i = value.length - 1; i >= 0; i--) {
        let digit = Number(value.charAt(i));
        if (alt) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        alt = !alt;
    }
    return (sum % 10 === 0) ? 0 : (10 - (sum % 10));
}