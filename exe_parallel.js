const fs = require('fs')

const quotes = require('./web_crawlers/_test_quotes').quotes
const brainyquotes = require('./web_crawlers/_test_brainyquotes').brainyquotes
const tiendaPet = require('./web_crawlers/tienda_pet').tiendaPetCrawler
const petHappy = require('./web_crawlers/pet_happy.js').petHappyCrawler

executeMultipleCrawlers().then(data => {
    let counter = 0
    data.forEach(element => {
        counter += 1
    })
    console.log(`${counter} products scraped`)
    let json = JSON.stringify(data, null, 2)
    fs.writeFile('./logs/products.json', json, (err) => {
        if (err) console.log('Error ocurred while saving to json')
        console.log(`${counter} products saved to products.json`)
    })
}).catch(err => {
    console.error('Error after executing multiple crawlers', err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let results = []
        
        // Crawlers to be used must be added here
        let resolvedPromises = [
            tiendaPet('dog', 'food'),
            petHappy('dog', 'food')
        ]
        
        Promise.all(resolvedPromises).then(dataArray => {
            dataArray.forEach(dataset => {
                dataset.forEach(data => {
                    results.push(data)
                })
            })
            resolve(results)
        }).catch(err => {
            console.log('error executing multiple crawlers')
            reject(err)
        })
    })
}