const fs = require('fs')

const dayMascotas = require('../web_crawlers/day_mascotas').dayMascotasCrawler
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
    // fs.writeFile('./logs/day_mascotas.json', json, (err) => {
    //     if (err) console.log('Error ocurred while saving to json')
    //     console.log(`${count} products saved to day_mascotas.json`)
    // })
}).catch(err => {
    console.error('Error after executing multiple day_mascotas crawlers', err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let results = []        
        // Chain the execution of the crawlers
        dayMascotas('dog', 'food')
        .then(data => {
            results = data
            utils.messages.sequentialSuccess(data.length, 'Day Mascotas', 'dog', 'food')
            return dayMascotas('cat', 'food')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Day Mascotas', 'cat', 'food')
            return dayMascotas('', 'med')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Day Mascotas', '', 'med')
            return dayMascotas('', 'acc')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Day Mascotas', '', 'acc')
            resolve(results)
        })
        .catch(err => {
            utils.messages.sequentialError('Day Mascotas', err)
            console.log('Error from sequentially executing the crawlers: ', err)
            reject(err)
        })
    })
}