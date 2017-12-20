const xray = require('x-ray')
const utils = require('../tools/utils')

exports.petHappyCrawler = (animal, category) => {
    return new Promise((resolve, reject) => {
        // Array that will be used to pass the urls to the crawler
        let urls = []
        // These objects contain the necessary information to execute the crawlers 
        const dogFoodUrl = {
            url: 'https://www.pethappy.cl/perros-2/alimentos',
            animal: 'perro',
            category: 'comida'
        }
        const dogMedUrl = {
            url: 'https://www.pethappy.cl/perros-2/medicamentos-2',
            animal: 'perro',
            category: 'medicamento'
        }
        // Accessories and toys pages count towards the accessories category in the database
        const dogAccUrl = {
            url: 'https://www.pethappy.cl/perros-2/accesorios',
            animal: 'perro',
            category: 'accesorios'
        }
        const catFoodUrl = {
            url: 'https://www.pethappy.cl/gatos-2/alimentos',
            animal: 'gato',
            category: 'comida'
        }
        const catMedUrl = {
            url: 'https://www.pethappy.cl/gatos-2/medicamentos-1',
            animal: 'gato',
            category: 'medicamento'
        }
        // Accessories and toys pages count towards the accessories category in the database
        const catAccUrl = {
            url: 'https://www.pethappy.cl/gatos-2/accesorios',
            animal: 'gato',
            category: 'accesorios'
        }
        // scraped objects will be placed here
        let results = []
    
        if (animal == 'dog' && category == 'food') {
            urls.push(dogFoodUrl)
        } else if (animal == 'dog' && category == 'med') {
            urls.push(dogMedUrl)
        } else if (animal == 'dog' && category == 'acc') {
            urls.push(dogAccUrl)
        } else if (animal == 'cat' && category == 'food') {
            urls.push(catFoodUrl)
        } else if (animal == 'cat' && category == 'med') {
            urls.push(catMedUrl)
        } else if (animal == 'cat' && category == 'acc') {
            urls.push(catAccUrl)
        } else if (animal == 'all' && category == 'all'){
            urls.push(dogFoodUrl, dogMedUrl, dogAccUrl, catFoodUrl, catMedUrl, catAccUrl)
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
            console.log('Error executing Pet Happy web crawler')
            reject(err)
        })
    })
}

function webCrawler (url, animal, category) {
    // set the time to be used for making resquest
    let time = utils.getRandom(2, 2)
    let x  = xray({
        filters: {
            parseName: value => typeof value == 'string' ? utils.parseName(value) : value,
            parsePrice: value => typeof value == 'string' ? utils.parsePrice(value) : value,
            parseUrl: value => typeof vallue == 'string' ? 'https://www.pethappy.cl' + value : value,
            storeName: () => 'Pet Happy',
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
        console.log(`Crawler started: Pet Happy ${animal} ${category}`)
        x(
            url,
            'div.large-p.columns.producto-box',
            [{
                name: 'h1 a@html | parseName',
                url: 'a@href',
                price: '.precio | parsePrice',
                imageUrl: 'img@src',
                store: '| storeName',
                category: '| category',
                animal: '| animal',
                date: '| date'
            }]
        )
        .paginate('li.next a@href') // Next page button .css classes
        //.limit(1) // Pages to crawl limit
        ((err, data) => {
            if (err) {
                console.log(`Error from Pet Happy ${animal} ${category} web crawler`)
                reject(err)
            } else {
                let endTimer = utils.timer(startTimer)
                console.log(`== Pet Happy ${animal} ${category} web crawler completed in ${endTimer} ms`)
                resolve(data)
            }
        })
    })
}