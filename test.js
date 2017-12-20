const dayMascotas = require('./web_crawlers/day_mascotas').dayMascotasCrawler
const fs = require('fs')
const utils = require('./tools/utils')
const db = require('./database/mongodb')

executeMultipleCrawlers().then(data => {
    const count = data.length
    console.log(`${count} products scraped`)
    db.writeBatch(data)
    .then(docs => {
        console.log(`Batch succesfull. ${docs.length} documents saved to MongoDB`)
    })
    .catch(err => {
        console.log('Error executing batch')
    })
    // let json = JSON.stringify(data, null, 2)
    // fs.writeFile('./logs/quotes.json', json, (err) => {
    //     if (err) console.log('Error ocurred while saving to json')
    //     console.log(`${counter} products saved to products.json`)
    // })
}).catch(err => {
    console.error('Error after executing multiple crawlers', err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let results = []

        // Chain the execution of the crawlers
        dayMascotas('dog', 'food')
        .then(data => {
            results = data
            utils.messages.testMessage(data.length, 'Day Mascotas')
            resolve(results)
        })
        .catch(err => {
            console.log('Error from sequentially executing the crawlers: ', err)
            reject(err)
        })
    })
}