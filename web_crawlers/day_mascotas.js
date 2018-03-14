const xray = require('x-ray')
const utils = require('../tools/utils')

exports.dayMascotasCrawler = (animal, category) => {
    return new Promise((resolve, reject) => {
        // Array that will be used to pass the urls to the crawler
        let urls = []
        // These objects contain the necessary information to execute the crawlers 
        const dogFoodUrl = {
            url: 'http://daymascotas.cl/categoria-producto/alimentos-perro/',
            animal: 'perro',
            category: 'comida'
        }
        const catFoodUrl = {
            url: 'http://daymascotas.cl/categoria-producto/alimentos-gato/',
            animal: 'gato',
            category: 'comida'
        }
        const medUrl = {
            url: 'http://daymascotas.cl/categoria-producto/medicamentos-drag-pharma/',
            animal: '',
            category: 'medicamento'
        }
        // Accessories and toys pages count towards the accessories category in the database
        const accUrl = {
            url: 'http://daymascotas.cl/categoria-producto/accesorios/',
            animal: '',
            category: 'accesorio'
        }
        // scraped objects will be placed here
        let results = []
    
        if (animal == 'dog' && category == 'food') {
            urls.push(dogFoodUrl)
        } else if (animal == 'cat' && category == 'food') {
            urls.push(catFoodUrl)
        } else if (animal == '' && category == 'med') {
            urls.push(medUrl)
        } else if (animal == '' && category == 'acc') {
            urls.push(accUrl)
        } else if (animal == 'all' && category == 'all'){
            urls.push(dogFoodUrl, catFoodUrl, medUrl, accUrl)
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
            console.log('Error executing Day Mascotas web crawler')
            reject(err)
        })
    })
}

function webCrawler (url, animal, category) {
    // set the time to be used for making resquest
    let time = utils.getRandom(2, 2)
    // Create a instance of X-Ray to be used later
    let x  = xray({
        filters: {
            rmVisitanos: value => value === 'VISITANOS' ? value = '' : value,
            rmLlamanos: value => value === 'LLÁMANOS' ? value = '' : value,
            rmEscribenos: value => value === 'ESCRÍBENOS' ? value = '' : value,
            rmHorarios: value => value === 'HORARIOS' ? value = '' : value,
            parseName: value => typeof value == 'string' ? utils.parseName(value) : value,
            parsePrice: value => typeof value == 'string' ? utils.parsePrice(value) : value,
            storeName: () => 'Day Mascotas',
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
        // Initialize scraper
        console.log(`Crawler started: Day Mascotas ${animal} ${category}`)
        x(
            url,
            '.show-links-onimage',
            [{
                name: 'h2 | rmVisitanos | rmLlamanos | rmEscribenos | rmHorarios | parseName',
                href: 'a@href',
                price: '.price | parsePrice',
                imageHref: 'img@src',
                store: '| storeName',
                category: '| category',
                animal: '| animal',
                date: '| date'
            }]
        )
        .paginate('.next.page-numbers@href') // Next page button .css classes
        //.limit(1) // Pages to crawl limit
        ((err, data) => {
            if (err) {
                console.log(`Error from Day Mascotas ${animal} ${category} web crawler`)
                reject(err)
            } else {
                let endTimer = utils.timer(startTimer)
                console.log(`== Day Mascotas ${animal} ${category} web crawler completed in ${endTimer} ms`)
                resolve(data)
            }
        })
    })
}