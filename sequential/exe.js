const fs = require('fs')

const quotes = require('../web_crawlers/_test_quotes').quotes
const brainyquotes = require('../web_crawlers/_test_brainyquotes').brainyquotes
// const tiendaPet = require('../web_crawlers/tienda_pet').tiendaPetCrawler
// const petHappy = require('../web_crawlers/pet_happy.js').petHappyCrawler

executeMultipleCrawlers().then(data => {
    let counter = 0
    data.forEach(element => {
        counter += 1
    })
    console.log(`${counter} products scraped`)
    let json = JSON.stringify(data, null, 2)
    fs.writeFile('./logs/quotes.json', json, (err) => {
        if (err) console.log('Error ocurred while saving to json')
        console.log(`${counter} products saved to products.json`)
    })
}).catch(err => {
    console.error('Error after executing multiple crawlers', err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let counter = 0
        let results = []
        
        // Chain the execution of the crawlers
        quotes()
        .then(data => {
            data.forEach(product => {
                results.push(product)
                counter++
            })
            console.log(`${counter} items scraped from quotes`)
            return brainyquotes()
        })
        .then(data => {
            counter = 0
            data.forEach(product => {
                results.push(product)
                counter++
            })
            console.log(`${counter} items scraped from brainyquotes`)
            resolve(results)
        })
        .catch(err => {
            console.log('Error from sequentially executing the crawlers: ', err)
            reject(err)
        })
    })
}