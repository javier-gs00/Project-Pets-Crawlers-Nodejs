const fs = require('fs')

const quotes = require('../web_crawlers/_test_quotes').quotes
const brainyquotes = require('../web_crawlers/_test_brainyquotes').brainyquotes
const utils = require('../tools/utils')
const db = require('../database/mongodb')

// function used to simply insert new data to the db
// executeMultipleCrawlers().then(data => {
//     let counter = 0
//     data.forEach(element => {
//         counter += 1
//     })
//     console.log(`${counter} products scraped`)
//     db.insertManyQuotes(data)
//     .then(docs => {
//         console.log(`Batch succesfull. ${docs.length} quotes saved to MongoDB`)
//     })
//     .catch(err => {
//         console.log('Error executing batch')
//     })
//     // let json = JSON.stringify(data, null, 2)
//     // fs.writeFile('./logs/quotes.json', json, (err) => {
//     //     if (err) console.log('Error ocurred while saving to json')
//     //     console.log(`${counter} products saved to products.json`)
//     // })
// }).catch(err => {
//     console.error('Error after executing multiple crawlers', err)
// })

// function used to update and insert new data to the db
loadJson().then(data => {
    console.log(data.length)

    return db.updateBatchQuotes(data)
})
.then(results => {
    console.log('update batch success!!')
    console.log(results)
})
.catch(err => {
    console.log(err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let results = []

        // Chain the execution of the crawlers
        quotes()
        .then(data => {
            results = data
            utils.messages.testMessage(data.length, 'Quotes')
            return brainyquotes()
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.testMessage(data.length, 'BrainyQuotes')
            resolve(results)
        })
        .catch(err => {
            console.log('Error from sequentially executing the crawlers: ', err)
            reject(err)
        })
    })
}

function loadJson () {
    return new Promise ((resolve, reject) => {
        fs.readFile('logs/quotes_update.json', (err, data) => {
            if (err) reject(err)
            const quotesArray = JSON.parse(data)
            resolve(quotesArray)
        })
    })
}