const fs = require('fs')

const petHappy = require('../web_crawlers/pet_happy').petHappyCrawler
const utils = require('../tools/utils')

executeMultipleCrawlers().then(data => {
    const count = data.length
    console.log(`${count} products scraped`)
    let json = JSON.stringify(data, null, 2)
    fs.writeFile('./logs/pet_happy.json', json, (err) => {
        if (err) console.log('Error ocurred while saving to json')
        console.log(`${count} products saved to pet_happy.json`)
    })
}).catch(err => {
    console.error('Error after executing multiple pet_happy crawlers', err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let results = []        
        // Chain the execution of the crawlers
        petHappy('dog', 'food')
        .then(data => {
            results = data
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'dog', 'food')
            return petHappy('dog', 'med')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'dog', 'med')
            return petHappy('dog', 'acc')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'dog', 'acc')
            return petHappy('cat', 'food')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'cat', 'food')
            return petHappy('cat', 'med')
        })
        .then(data => {
            data.forEach(product => {
                results.push(product)
            })
            utils.messages.sequentialSuccess(data.length, 'Tienda Pet', 'cat', 'med')
            return petHappy('cat', 'acc')
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