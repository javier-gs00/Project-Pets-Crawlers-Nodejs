const xray = require('x-ray')
const utils = require('../tools/utils')

// returns an array of objects (products)
exports.tiendaPetCrawler = (animal, category) => {
    return new Promise((resolve, reject) => {
        // Array that will be used to pass the urls to the crawler
        let urls = []
        // These objects contain the necessary information to execute the crawlers 
        const dogFoodUrl = {
            url: 'https://www.tiendapet.cl/catalogo/perro/alimentos/',
            animal: 'perro',
            category: 'comida'
        }
        const dogMedUrl = {
            url: 'https://www.tiendapet.cl/catalogo/perro/farmacia/',
            animal: 'perro',
            category: 'medicamento'
        }
        // Accessories and toys pages count towards the accessories category in the database
        const dogAccUrl = {
            url: 'https://www.tiendapet.cl/catalogo/perro/accesorios/',
            animal: 'perro',
            category: 'accesorio'
        }
        const dogToysUrl = {
            url: 'https://www.tiendapet.cl/catalogo/perro/juguetes/',
            animal: 'perro',
            category: 'accesorio'
        }
        const catFoodUrl = {
            url: 'https://www.tiendapet.cl/catalogo/gato/alimentos/',
            animal: 'gato',
            category: 'comida'
        }
        const catMedUrl = {
            url: 'https://www.tiendapet.cl/catalogo/gato/farmacia/',
            animal: 'gato',
            category: 'medicamento'
        }
        // Accessories and toys pages count towards the accessories category in the database
        const catAccUrl = {
            url: 'https://www.tiendapet.cl/catalogo/gato/accesorios/',
            animal: 'gato',
            category: 'accesorio'
        }
        const catToysUrl = {
            url: 'https://www.tiendapet.cl/catalogo/gato/juguetes/',
            animal: 'gato',
            category: 'accesorio'
        }
        // scraped objects will be placed here
        let results = []
    
        if (animal == 'dog' && category == 'food') {
            urls.push(dogFoodUrl)
        } else if (animal == 'dog' && category == 'med') {
            urls.push(dogMedUrl)
        } else if (animal == 'dog' && category == 'acc') {
            urls.push(dogAccUrl, dogToysUrl)
        } else if (animal == 'cat' && category == 'food') {
            urls.push(catFoodUrl)
        } else if (animal == 'cat' && category == 'med') {
            urls.push(catMedUrl)
        } else if (animal == 'cat' && category == 'acc') {
            urls.push(catAccUrl, catToysUrl)
        } else if (animal == 'all' && category == 'all'){
            urls.push(dogFoodUrl, dogMedUrl, dogAccUrl, dogToysUrl, catFoodUrl, catMedUrl, catAccUrl, catToysUrl)
        }
    
        // Create an array containing the executed crawlers
        let resolvedPromises = urls.map(input => webCrawler(input.url, input.animal, input.category))
        // Each result of the crawlers will be contained in the dataArray as another array
        Promise.all(resolvedPromises).then(dataArray => {
            // iterate over each crawler results
            dataArray.forEach(productsArray => {
                // push the crawled data into a single array
                productsArray.forEach(product => {
                    results.push(product)
                })
            })
            resolve(results)
        }).catch(err => {
            console.log('Error executing Tienda Pet web crawler')
            reject(err)
        })
    })
}

// Main function to scrape the data
function webCrawler (url, animal, category) {
    let time = utils.getRandom(2, 2)
    let x  = xray({
        filters: {
            parseName: value => typeof value == 'string' ? utils.parseName(value.split("/")[6]) : value,
            parsePrice: value => typeof value == 'string' ? utils.parsePrice(value) : value,
            storeName: () => 'Tienda Pet',
            category: () => category,
            animal: () => animal,
            date: () => utils.currentDateFormatted()
        }
    })
    .delay(time)
    .concurrency(1)
    .throttle(1, time)

    return new Promise ((resolve, reject) => {
        let startTimer = utils.timer();
        // Init scraper
        console.log(`Crawler started: Tienda Pet ${animal} ${category}`)
        x(
            url,
            'div.block-producto',
            [{
                name: 'a.catalogo_click_detail@href | parseName',
                url: 'a.catalogo_click_detail@href',
                price: 'table@html',
                imageUrl: 'img@src',
                store: '| storeName',
                category: '| category',
                animal: '| animal',
                date: '| date'
            }]
        )
        .paginate('a.fa-chevron-right@href') // Next page button .css classes
        //.limit(1) // Pages to crawl limit
        ((err, data) => {
            if (err) {
                console.log(`== Error executing Tienda Pet ${animal} ${category} web crawler`)
                reject(err)
            } else {
                let endTimer = utils.timer(startTimer)
                console.log(`== Tienda Pet ${animal} ${category} web scraper completed in ${endTimer} ms`)
                let products = handleTableData(data)
                resolve(products)
            }
        })
    })
}

// Transforms an Objects array into a new Objects array formated for the Product Model
function handleTableData (data) {
    // newData will be an array with the new generated objects
    let newDataArray = []
    // iterate through data to handle the html tables on the price attribute of the data
    data.forEach(product => {
        let htmlTable = product.price
        //.replace(' ', '').replace('/\n/', '').trim()
        // find out how many rows the table data has
        let tr = ocurrences(htmlTable, '<tr>', false)
        // find out how many data points the table has. If it has just one it means the product is out of stock
        let td = ocurrences(htmlTable, '<td>', false)
        // If it has just one td, don't save the product and skip it.
        // If it has more than one td, it means it has at least one product
        if (td != 1) {
            // iterate over the table rows to create new objects (products)
            while (tr > 0) {
                // Locate <span> tags that indicate a discount
                let spanStart = htmlTable.indexOf('<span')
                let spanEnd = htmlTable.indexOf('</span>')

                // Locate the first set of td elements containing the end
                // of the product name
                let startTdName = htmlTable.indexOf('<td>')
                let endTdName = htmlTable.indexOf('</td>')
                // If a span exists, find out if the spans belong to the current row
                endTdName = spanStart > 0 && spanStart < endTdName ? spanStart : endTdName
                let nameEnd = htmlTable.slice(startTdName + '<td>'.length, endTdName)
                // Join the main product name and the end of it that was contained in the <table>
                let newName = product.name.replace('/\n/', '').trim() + ' ' + nameEnd.replace('/\n/', '').trim()
                
                // Extract the second set of td elements containing the price
                let startTdPrice = htmlTable.indexOf('<td>', endTdName)
                let endTdPrice = htmlTable.indexOf('</td>', startTdPrice)
                let newPrice = htmlTable.slice(startTdPrice + '<td>'.length, endTdPrice)
                // newPrice = parseInt(newPrice.replace(/[A-z$,.]/g, ''))
                newPrice = utils.parsePrice(newPrice)
    
                // Create the new product to be added to the array
                let newData = new Product(
                    newName,
                    product.url,
                    newPrice,
                    product.imageUrl,
                    product.store,
                    product.category,
                    product.animal
                )
                // Truncate the string removing the current <tr>
                let trEnd = htmlTable.indexOf('</tr>')
                htmlTable = htmlTable.slice(trEnd + '</tr>'.length)
                newDataArray.push(newData)
                tr--
            } 
        }
    })
    return newDataArray
}

function Product (name, url, price, imageUrl, store, category, animal) {
    this.name = name
    this.url = url
    this.price = price
    this.imageUrl = imageUrl
    this.store = store
    this.category = category
    this.animal = animal
}

// taken from https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
/* Function that count occurrences of a substring in a string;
* @param {String} string               The string
* @param {String} subString            The sub string to search for
* @param {Boolean} [allowOverlapping]  Optional. (Default:false)
*
* @author Vitim.us https://gist.github.com/victornpb/7736865
* @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
* @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
*
* Used to count number of <tr> in a HTML table
*/
function ocurrences (string, subString, allowOverlaping) {
    // Coerces the types to string in case an integer is input
    string += ""
    subString += ""
    // return (string.length+1) this is to prevent infinity loop when entering occurrence('foo','') will return 4, 
    // because occurrences('','')==1 so occurrence(bar,'')===bar.lenght+1
    // this is the same behavior of regex 
    if (subString.length <= 0) return (string.length + 1)

    let n = 0
    let pos = 0
    let step = allowOverlaping ? 1 : subString.length

    while (true) {
        pos = string.indexOf(subString, pos)
        if(pos >=  0) {
            ++n
            pos += step
        } else break
    }
    return n
}

