const fs = require('fs')

const tiendaPet = require('../web_crawlers/pet_happy').tiendaPetCrawler

executeMultipleCrawlers().then(data => {
    let counter = 0
    data.forEach(element => {
        counter += 1
    })
    console.log(`${counter} products scraped`)
    let json = JSON.stringify(data, null, 2)
    fs.writeFile('./logs/tienda_pet.json', json, (err) => {
        if (err) console.log('Error ocurred while saving to json')
        console.log(`${counter} products saved to tienda_pet.json`)
    })
}).catch(err => {
    console.error('Error after executing multiple Tienda Pet crawlers', err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let counter = 0
        let results = []
        
        // Chain the execution of the crawlers
        tiendaPet('dog', 'food')
        .then(data => {
            data.forEach(product => {
                results.push(product)
                counter++
            })
            console.log(`${counter} products scraped from Tienda Pet`)
            return tiendaPet('cat', 'acc')
        })
        .then(data => {
            counter = 0
            data.forEach(product => {
                results.push(product)
                counter++
            })
            console.log(`${counter} products scraped from Tienda Pet`)
            resolve(results)
        })
        .catch(err => {
            console.log('Error from sequentially executing the crawlers: ', err)
            reject(err)
        })
    })
}