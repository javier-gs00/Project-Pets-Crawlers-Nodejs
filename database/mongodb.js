const mongoose = require('mongoose')
const utils = require('../tools/utils')

mongoose.Promise = global.Promise
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

// The following schema and functions are used to test features
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