const mongoose = require('mongoose')
const utils = require('../tools/utils')

mongoose.Promise = require('bluebird')
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/projectpetsnodejs', {
    useMongoClient: true
}, (err) => {
    if (err) console.log('Error connecting to MongoDB. Error description: ', err)
    console.log('MongoDB connection succesful')
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error: '))

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    url: String,
    imageUrl: String,
    category: String,
    animal: { type: String, default: '' },
    store: String,
    date: { type: Date, default: new Date() }
})

const ProductModel = mongoose.model('Product', ProductSchema)

// Check for changes in documents. Takes an array of objects and returns an array of objects
exports.updateBatch = data => {
    return new Promise((resolve, reject) => {
        // Declare an array for products to be updated
        let toBeUpdated = []
        data.forEach(product => {
            ProductModel.findOne({
                name: product.name, 
                store: product.store, 
                category: product.category, 
                animal: product.animal}, (err, doc) => {
                    // Throws an error if the product it's not found
                    // In this case save the product
                    if (err) {
                        ProductModel.insert(product, res => {
                            console.log('Saved a new product', res)
                        })
                    } else {
                        // If no errors. Product was found. Check if price is different
                        if (doc.price != product.price) {
                            ProductModel.findByIdAndUpdate(doc.id, {
                                price: product.price,
                                date: new Date()
                            }, (err, res) => {
                                if (err) console.error(`Update to product id: ${doc.id} failed with err:`, err)
                                console.log(`Update to product id: ${doc.id} succesfull`)
                            })
                        }
                    }
                })

        })
    })
}

// Makes a batch insert to the db. Takes an array of objects
exports.writeBatch = data => {
    return new Promise((resolve, reject) => {
        utils.checkData(data)
        .then(data => {
            ProductModel.insertMany(data)
            .then(docs => {
                db.close(err => {
                    if (err) console.error('Error disconnecting from MongoDB: ', err)
                    console.log('Disconnected from MongoDB')
                })
                resolve(docs)
            })
            .catch(err => {
                console.log('Error writing batch')
                reject(err)
                db.close(err => {
                    if (err) console.error('Error disconnecting from MongoDB: ', err)
                    console.log('Disconnected from MongoDB')
                })
            })
        })
        .catch(function (err) {
            let error = new Error('Save Many Product Model error...')
            reject(error)
        });
    })
}

/* ================================================================== */
// The following schema and functions are used to test changes and new features
// on a similar dataset
/* ================================================================== */

const QuotesSchema = new mongoose.Schema({
    text: String,
    author: String,
    date: { type: Date, default: new Date() }
})

const QuoteModel = mongoose.model('Quote', QuotesSchema)

exports.insertManyQuotes = data => {
    return new Promise((resolve, reject) => {
        QuoteModel.insertMany(data)
        .then(docs => {
            resolve(docs)
            db.close(err => {
                if (err) console.error('Error disconnecting from MongoDB: ', err)
                console.log('Disconnected from MongoDB')
            })
        })
        .catch(error => {
            console.log(error)
            db.close(err => {
                if (err) console.error('Error disconnecting from MongoDB: ', err)
                console.log('Disconnected from MongoDB')
            })
            reject(err)
        })
    })
}

// Check for changes in documents. Takes an array of objects and returns an array of objects
// exports.updateBatchQuotes = data => {
//     return new Promise((resolve, reject) => {
//         let counter = 0
//         data.forEach(quote => {
//             QuoteModel.findOne({text: quote.text}, (err, doc) => {
//                     // Throws an error if the product it's not found
//                     // In this case save the product
//                     console.log('tic')
//                     // console.log(typeof doc)
//                     // console.log(doc)
//                     // console.log(quote)
//                     if (!doc) {
//                         let newQuote = new QuoteModel(quote)
//                         newQuote.save((err, newDoc) => {
//                             console.log('Saved a new quote')                           
//                             counter++
//                         })
//                         // QuoteModel.save(quote, res => {
//                         //     console.log('Saved a new quote', res)
//                         // })
//                     } else {
//                         // If no errors. Product was found. Check if price is different
//                         if (doc.author != quote.author) {
//                             QuoteModel.findByIdAndUpdate(doc.id, {
//                                 text: quote.text,
//                                 author: quote.author,
//                                 date: quote.date
//                             }, (err, res) => {
//                                 if (err) console.error(`Update to quote id: ${doc.id} failed with err:`, err)
//                                 console.log(`Update to quote id: ${doc.id} succesfull`)
//                                 counter++
//                             })
//                         }
//                     }
//                 })
//         })
//         console.log(counter)
//         if (counter == data.length) {
//             db.close(err => {
//                 if (err) console.error('Error disconnecting from MongoDB: ', err)
//                 console.log('Disconnected from MongoDB')
//             })
//             resolve('Works!')
//             reject(':(!!')
//         }
//     })
// }

// Check for changes in documents. Takes an array of objects and returns an array of objects
exports.updateBatchQuotes = data => {
    return new Promise((resolve, reject) => {
        // let counter = 0
        // data.forEach(quote => {
        //     QuoteModel.findOne({text: quote.text})
        //     .then(mongoQuote => {
        //         console.log(mongoQuote)
        //         resolve(mongoQuote)
        //     })
        //     .catch(err => {
        //         reject(err)
        //     })
        // })
        let promiseArray = []
        // data.forEach(quote => {
        //     QuoteModel.findOne({text: quote.text})
        //     .then(doc => {
        //         if(!doc) {
        //             let newQuote = new QuoteModel(doc)
        //             promiseArray.push(newQuote.save())
        //         }
        //         if(doc.author != quote.author) {
        //             doc.author = quote.author
        //             promiseArray.push(doc.save())
        //         }
        //     })
        // })
        for(let i = 0, n = data.length; i < n; i++) {
            let query = {
                text: data[i].text
            }
            let update = {
                text: data[i].text,
                author: data[i].author,
                date: data[i].date
            }
            let options = {upsert: true, new: true, setDefaultsOnInsert: true}
            promiseArray.push(QuoteModel.findOneAndUpdate(query, update, options))
        }
        Promise.all(promiseArray)
        .then(results => {
            resolve(results)
            db.close(err => {
                if (err) console.error('Error disconnecting from MongoDB: ', err)
                console.log('Disconnected from MongoDB')
            })
        })
        .catch(err => {
            console.log(err)
            reject(err)
        })
    })
}