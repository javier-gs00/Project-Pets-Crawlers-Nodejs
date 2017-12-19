/* The porpuse of this module is to test continuosly against a site that allows it */
const xray = require('x-ray')
const utils = require('../tools/utils')

exports.quotes = () => {
    return new Promise((resolve, reject) => {
        let urls = []
        const quotesInput = {
            url: 'http://quotes.toscrape.com/'
        }
        urls.push(quotesInput)
        // scraped objects will be placed to here
        let results = []
    
        let resolvedPromises = urls.map(input => webCrawler(input.url))
        Promise.all(resolvedPromises).then(dataArray => {
            dataArray.forEach(productsArray => {
                productsArray.forEach(product => {
                    results.push(product)
                })
            })
            resolve(results)
        }).catch(err => {
            console.log('Error executing Quotes.toscrape web crawler')
            reject(err)
        })
    })
}

function webCrawler (url) {
    let x = xray()
    .delay(utils.getRandom(2, 2))
    .concurrency(1)
    .throttle(1, utils.getRandom(2, 2))

    return new Promise((resolve, reject) => {
        x(url, '.quote', [{
            text: '.text',
            author: '.author'
        }])
        // .paginate('li.next a@href')
        .limit(1)
        ((err, data) => {
            if (err) {
                console.error('Error executing quotes web crawler', err)
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}
