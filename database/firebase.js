const admin = require("firebase-admin")
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://project-pets-00.firebaseio.com"
})
let db = admin.firestore()

// Get the 'products' collection reference
const productsRef = db.collection('products')

// Use Firestore "Transactions" to update values
// If a document is not found it will be added as a new document
exports.updateMany = (data, callback) => {
    let newProductsCount = 0
    let updatedProductsCount = 0
    let errorCount = 0
    let itemsProcessed = 0
    let totalItems = data.length

    data.forEach(product => {
        db.runTransaction(transaction => {
            let productID = product.name + product.store + product.animal + product.category
            productID = productID.replace(/[ ,.]/g, "")
            let productRef = db.doc('products/' + productID)
            // .where('name', '==', product.name)
            // .where('store', '==', product.store)
            // .where('category', '==', product.category)
            // .where('animal', '==', product.animal)

            return transaction.get(productRef).then(doc => {
                if (doc.exists && doc.data().price != product.price) {
                    transaction.update(productRef, {
                        price: product.price,
                        date: new Date()
                    })
                    updatedProductsCount++
                } else {
                    transaction.create(productRef, {
                        name: product.name,
                        url: product.url,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        store: product.store,
                        category: product.category,
                        animal: product.animal,
                        date: new Date()
                    })
                    newProductsCount++
                }
            }).catch(() => {
                errorCount++
                console.log('Transaction failure')
            })
        })  
        itemsProcessed++
        if (itemsProcessed == totalItems) {
            let results = {
                new: newProductsCount, 
                updates: updatedProductsCount
            }
            console.log(`${itemsProcessed} & ${totalItems}`)
            console.log(newProductsCount)
            console.log(updatedProductsCount)
            callback(errorCount, results)
        }
    })
}
// Initialize document
// var cityRef = db.collection('cities').doc('SF');
// var setCity = cityRef.set({
//     name: 'San Francisco',
//     state: 'CA',
//     country: 'USA',
//     capital: false,
//     population: 860000
// });

// var transaction = db.runTransaction(t => {
//     return t.get(cityRef)
//         .then(doc => {
//             // Add one person to the city population
//             var newPopulation = doc.data().population + 1;
//             t.update(cityRef, { population: newPopulation });
//         });
// })
// .then(result => {
//     console.log('Transaction success!');
// })
// .catch(err => {
//     console.log('Transaction failure:', err);
// });

// Batched writes. For use with set(), update() and delete()
// when there is no need to read first
// Is receives an array of objects
exports.writeBatch = data => {
    let batch = db.batch();
    data.forEach(product => {
        // Set the values for each new product
        let productID = product.name + product.store + product.animal + product.category
        productID = productID.replace(/[ ,.]/g, "")
        // console.log(typeof productID)
        let newProduct = productsRef.doc(productID)
        batch.set(newProduct, {
            name: product.name,
            url: product.url,
            price: product.price,
            imageUrl: product.imageUrl,
            store: product.store,
            category: product.category,
            animal: product.animal,
            date: new Date()
        })
    })
    // Commit the batch
    return batch.commit().then(value => {
        console.log('Write batch succeded')
        console.log(value[0])
    }).catch(value => {
        console.log('Write batch failed')
        console.log(value)
    })
}

exports.updateBatch = data => {
    data.forEach(product => {
        let productID = product.name + product.store + product.animal + product.category
        productID = productID.replace(/[ ,.]/g, "")

        let productRef = productsRef.doc(productID)
        productRef.get().then(snapshot => {
            if (snapshot.exists) {
                snapshot.forEach(doc => {
                    if(doc.data().price != product.price) {
                        productRef.update({
                            price: product.price,
                            date: new Date()
                        }).then(() => {
                            console.log('update successful')
                        }).catch(() => {
                            console.log('update failed')
                        })
                    }
                })
            } else {
                productRef.set({
                    name: product.name,
                    url: product.url,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    store: product.store,
                    category: product.category,
                    animal: product.animal,
                    date: new Date()
                }).then(() => {
                    console.log('create successful')
                }).catch(() => {
                    console.log('create failed')
                })
            }
        })
    })
}
// var batch = db.batch();

// // Set the value of 'NYC'
// var nycRef = db.collection('cities').doc('NYC');
// batch.set(nycRef, { name: 'New York City' });

// // Update the population of 'SF'
// var sfRef = db.collection('cities').doc('SF');
// batch.update(sfRef, { population: 1000000 });

// // Delete the city 'LA'
// var laRef = db.collection('cities').doc('LA');
// batch.delete(laRef);

// // Commit the batch
// return batch.commit().then(function () {
//     // ...
// });

// Save documents one by one
exports.insertMany = data => {
    data.forEach(product => {
        // Set the values for each new product
        productsRef.doc().set({
            name: product.name,
            url: product.url,
            price: product.price,
            imageUrl: product.imageUrl,
            store: product.store,
            category: product.category,
            animal: product.animal,
            date: new Date()
        }).then(() => {
            console.log('Product successfully saved to Firestore')
        }).catch(() => {
            console.log('Error saving product to Firestore')
        })
    })
}

// Find one document using exact match in wording
exports.findOne = (name, store, category, animal) => {
    return new Promise((resolve, reject) => {
        productsRef
        .where('name', '==', name)
        .where('store', '==', store)
        .where('category', '==', category)
        .where('animal', '==', animal)
        .get().then(snapshot => {
            // console.log(snapshot)
            if (snapshot.empty) {
                // console.log('product not found')
                reject('not found')
            }
            snapshot.forEach(doc => {
                resolve(doc)
            })
        }).catch(err => {
            let exists = false
            reject(exists)
        })
    })
}

// Count products
exports.countProducts = (callback) => {
    let productCount = 0
    productsRef.get().then(snapshot => {
        snapshot.forEach(doc => {
            productCount++
        })
        callback(null, productCount)
    }).catch(err => {
        console.log(err)
        callback(err)
    })
}

exports.customQuery = query => {
    productsRef
    .where('name', '<', 'adultp')
    .where('name', '>=', 'adulto')
    .get().then(snapshot => {
        if(snapshot.empty) {
            console.log('not found')
        } else {
            snapshot.forEach(doc => {
                console.log(doc.data().name)
            })
        }
    })
}

// module.exports = db