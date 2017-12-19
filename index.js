const db = require('./database/firebase')
const fs = require('fs')

const quotes = require('./web_crawlers/quotes').quotes
const brainyquotes = require('./web_crawlers/brainyquotes').brainyquotes

// quotes().then(data => {
//     let counter = 0
//     data.forEach(element => {
//         counter += 1
//     })
//     console.log(`${counter} quotes scraped from quotes.toscrape.com`)
//     // db.writeBatch(data).then(value => {
//     //     console.log('Write batch to Firestore succeded')
//     //     console.log(value)
//     // }).catch(value => {
//     //     console.log('Write batch to Firestore failed')
//     //     console.log(value)
//     // })
//     let json = JSON.stringify(data, null, 2)
//     fs.writeFile('quotes.json', json, (err) => {
//         if (err) console.log('Error ocurred while saving to json')
//         console.log(`${counter} quotes saved to quotes.json`)
//     })
// }).catch(err => {
//     console.log(err)
// })

// const tiendaPet = require('./web_crawlers/tienda_pet').tiendaPet

// tiendaPet('all', 'all').then(data => {
//     let counter = 0
//     data.forEach(element => {
//         counter += 1
//     })
//     let json = JSON.stringify(data, null, 2)
//     fs.writeFile('tiendapet.json', json, (err) => {
//         if (err) console.log('Error ocurred while saving to json')
//         console.log('tiendapet.json saved successfully!')
//     })
// }).catch(err => {
//     console.log(err)
// })
// .then(data => {
//     let counter = 0
//     data.forEach(element => {
//         counter += 1
//     })
//     console.log(`${counter} products scraped`)
//     // db.writeBatch(data).then(() => {
//     //     console.log('Write batch to Firestore succeded')
//     // }).catch(value => {
//     //     console.log('Write batch to Firestore failed')
//     // })
//     let json = JSON.stringify(data, null, 2)
//     fs.writeFile('tiendapet.json', json, (err) => {
//         if (err) console.log('Error ocurred while saving to json')
//         console.log('tiendapet2.json saved successfully!')
//     })
// }).catch(error => {
//     console.log(error)
// })

// const petHappy = require('./web_crawlers/pet_happy')

// petHappy.byAnimalAndCategory('https://www.pethappy.cl/perros-2/alimentos', 'dog', 'food')
// .then(data => {
//     let counter = 0
//     data.forEach(element => {
//         counter += 1
//     })
//     let json = JSON.stringify(data, null, 2)
//     fs.writeFile('pethappy.json', json, (err) => {
//         if (err) console.log('Error ocurred while saving to json')
//         console.log('tiendapet.json saved successfully!')
//     })
// }).catch(error => {
//     console.log(error)
// })

// db.findOne('royal canin maxi adulto 15 kg.', 'Tienda Pet', 'food', 'dog')
// .then(data => {
//     console.log(data.data())
// })
// .catch(error => {
//     console.log(`Product doesn't exist`)
// })
// db.countProducts((err, productCount) => {
//     console.log(`Total product count in collection is ${productCount}`)
// })

// let docRef = db.collection('products')
// .where('name', '==', 'proplan adulto large 15 kg.')
// .where('store', '==', 'Pet')
// .where('category', '==', 'food')
// .where('animal', '==', 'dog')
// .get()

// docRef.then(snapshot => {
//     // console.log(snapshot)
//     if (snapshot.empty) {
//         console.log('empty query')
//     } else {
//         console.log('found something')
//     }
// })

// let productRef = db.collection('products').doc('1i595hwGebiEzC88axiX')
// let productRef = db.collection('products')
// .where('name', '==', 'proplan adulto large 15 kg.')
// .where('store', '==', 'Tienda Pet')
// .where('category', '==', 'food')
// .where('animal', '==', 'dog')

// console.log(productRef.get())

// Write a batch to firestore
// load a json file to firestore
// fs.readFile('./tiendapet.json', (err, data) => {
//     const dataset = JSON.parse(data)
//     db.writeBatch(dataset).then(() => {
//         console.log('batch successfull')
//     }).catch(() => {
//         console.log('batch failed')
//     })
// })

// load a json file to firestore
// fs.readFile('./tiendapet_mod.json', (err, data) => {
//     const dataset = JSON.parse(data)
//     db.updateMany(dataset, (errors, results) => {
//         console.log(`new products count: ${results.new} \nupdated products count: ${results.updates}`)
//         console.log(`Process terminated with ${errors} errors`)
//     })
// })


// fs.readFile('./tiendapet_mod.json', (err, data) => {
//     const dataset = JSON.parse(data)
//     db.updateBatch(dataset)
// })

// db.customQuery('royal')