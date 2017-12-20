const fs = require('fs')

const tiendaPet = require('../web_crawlers/tienda_pet').tiendaPetCrawler
const utils = require('../tools/utils')
const db = require('../database/mongodb')

executeMultipleCrawlers().then(data => {
    const count = data.length
    console.log(`${count} products scraped`)
    let json = JSON.stringify(data, null, 2)
    db.writeBatch(data)
    .then(docs => {
        console.log(`Batch succesfull. ${docs.length} documents saved to MongoDB`)
    })
    .catch(err => {
        console.log('Error executing batch')
    })
    // fs.writeFile('./logs/tienda_pet.json', json, (err) => {
    //     if (err) console.log('Error ocurred while saving to json')
    //     console.log(`${count} products saved to tienda_pet.json`)
    // })
}).catch(err => {
    console.error('Error after executing multiple Tienda Pet crawlers', err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let results = []        
        // Chain the execution of the crawlers
        tiendaPet('dog', 'food')
        .then(data => {
            results = data
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'dog', 'food')
            return tiendaPet('dog', 'med')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'dog', 'med')
            return tiendaPet('dog', 'acc')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'dog', 'acc')
            return tiendaPet('cat', 'food')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'cat', 'food')
            return tiendaPet('cat', 'med')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'cat', 'med')
            return tiendaPet('cat', 'acc')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'cat', 'acc')
            resolve(results)
        })
        .catch(err => {
            utils.messages.sequentialError('Tienda Pet', err)
            console.log('Error from sequentially executing the crawlers: ', err)
            reject(err)
        })
    })
}