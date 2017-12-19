const fs = require('fs')

const petHappy = require('../web_crawlers/pet_happy').petHappyCrawler

executeMultipleCrawlers().then(data => {
    let counter = 0
    data.forEach(element => {
        counter += 1
    })
    console.log(`${counter} products scraped`)
    let json = JSON.stringify(data, null, 2)
    fs.writeFile('./logs/pet_happy.json', json, (err) => {
        if (err) console.log('Error ocurred while saving to json')
        console.log(`${counter} products saved to pet_happy.json`)
    })
}).catch(err => {
    console.error('Error after executing multiple pet_happy crawlers', err)
})

function executeMultipleCrawlers () {
    return new Promise ((resolve, reject) => {
        let counter = 0
        let results = []
        
        // Chain the execution of the crawlers
        petHappy('dog', 'food')
        .then(data => {
            data.forEach(product => {
                results.push(product)
                counter++
            })
            console.log(`${counter} products scraped from Pet Happy`)
            return petHappy('cat', 'food')
        })
        .then(data => {
            counter = 0
            data.forEach(product => {
                results.push(product)
                counter++
            })
            console.log(`${counter} products scraped from Pet Happy`)
            resolve(results)
        })
        .catch(err => {
            console.log('Error from sequentially executing the crawlers: ', err)
            reject(err)
        })
    })
}