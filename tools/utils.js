const validator = require('validator')

// Removes accents and other symbols from product names
exports.parseName = name => {
    return name
    .replace(/-/g, ' ')
    .replace(/&#x2013;/gi, ' ')
    .replace(/&#xa0;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#x2018;/gi, "'")
    .replace(/&#x2019;/gi, "'")
    .replace(/&#xC1;/gi, 'A')
    .replace(/&#xc4;/gi, 'A') 
    .replace(/&#xe1;/gi, 'a')
    .replace(/&#xc9;/gi, 'E')
    .replace(/&#xcb;/gi, 'E')
    .replace(/&#xe9;/gi, 'e')
    .replace(/&#xcd;/gi, 'I')
    .replace(/&#xed;/gi, 'i')
    .replace(/&#xd3;/gi, 'O')
    .replace(/&#xF3;/gi, 'o')
    .replace(/&#xda;/gi, 'U')
    .replace(/&#xfa;/gi, 'u')
    .replace(/&#xdc;/gi, 'U')
    .replace(/&#xfc;/gi, 'u')
    .replace(/&#xd1;/gi, 'N')
    .replace(/&#xf1;/gi, 'n')
}

// Transform a price from string to int
exports.parsePrice = price => {
    return parseInt(price.replace(/[A-z$,.]/g, ''))
}

// Generate a random integer between "min" and "min + range - 1"
exports.getRandom = (min, range) => Math.floor((Math.random() * range) + min) * 1000

// Timer function to measure time between two points in the code
exports.timer = t0 => {
    if (!t0) return process.hrtime()
    
    const t1 = process.hrtime(t0)

    return Math.round((t1[0]*1000 + (t1[1]/1000000)))
}

// Get current date
exports.currentDate = () => new Date()

// Get current date in the format YYYY/MM/DD
exports.currentDateFormatted = () => {
    let date = new Date();
    // Get the day as a string in format: YYYY/MM/DD
    let today = date.getFullYear() + '/' + (date.getMonth() + 1 ) + '/' + date.getDate();
    return today;
}

// Check that the scraped data contains values for name, price and href
exports.checkData = data => {
    return new Promise(function (resolve, reject) {
        data.forEach(function (product) {
            if (product.name === '' || product.price === '' || product.url === '') {
                const err = 'Incomplete scraped data';
                reject(err);
            }
        })
        resolve(data);
    })
}

// Validation functions built on top of the validator module
exports.validation = {
    length: function (input, min, max, errmsg) {
        if (validator.isLength(input, { min: min, max: max }) == false) {
            return errmsg
        } else {
            return ''
        }
    },

    alpha: function (input, language, errmsg) {
        if (validator.isAlpha(input, [language]) == false) {
            return errmsg
        } else {
            return ''
        }
    },

    match: function (input, regex, errmsg) {
        if (validator.matches(input, regex, "i") == false) {
            return errmsg
        } else {
            return ''
        }
    },

    equal: function (input1, input2, errmsg) {
        if (input1 !== input2) {
            return errmsg
        } else {
            return ''
        }
    },

    email: function (input, errmsg) {
        if (validator.isEmail(input) == false) {
            return errmsg
        } else {
            return ''
        }
    },

    normalizeEmail: function (input) {
        if (validator.normalizeEmail(input) == false) {
            return input
        } else {
            return validator.normalizeEmail(input)
        }
    },

    url: function (input, errmsg) {
        if (validator.isURL(input) == false) {
            return errmsg
        } else {
            return ''
        }
    },

    numeric: function (input, errmsg) {
        if (validator.isNumeric(input) == false) {
            return errmsg
        } else {
            return ''
        }
    }
}

// Message logs
exports.messages = {
    sequentialSuccess: function (count, store, animal, category) {
        return console.log(`${count} products scraped from ${store} ${animal} ${category}`)
    },
    sequentialError: function (store, err) {
        return console.log(`Error from sequentially executing ${store} crawlers`, err)
    },
    testMessage: (count, store) => console.log(`${count} products scraped from ${store}`)
}
