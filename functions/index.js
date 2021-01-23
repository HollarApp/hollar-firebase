const functions = require('firebase-functions');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});


exports.getStoreFrontMenu = functions.https.onCall( async (data, context) => {
    // fetch menu data
    storeId = data.storeId;
    
    const db = admin.firestore()
    const sectionRef = await db.collection('menu').doc(storeId).collection("sections").get();

    const receivedData = sectionRef.docs.map((value, index, arr) => {
        //console.log(value.data())
        return value.data()
    })

    //fetch store meta data (address, city, etc)
    const storeRef = await db.collection("store").doc(storeId).get()
    const storeData = storeRef.data()

    const returnData = {...storeData, 
        "sections": Object.values(receivedData)
    }
    
    //console.log(returnData)

    return returnData;
});

exports.getOrders = functions.https.onCall( async (data, context) => {
  // fetch order data
  storeId = data.storeId;

  const db = admin.firestore();
  const ordersRef = await db.collection('order');

  var orders = [];
  var completedOrders = [];
  var pendingOrders = [];

  ordersRef.where("storeID", "==", storeID)
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc){
        orders.push({...doc.data(), orderID: doc.id});
      });
    })
    .catch(function(error)){
      console.log("Error in getOrders: ", error);
    }

  orders.forEach((order, index) => {
    orders.completed ? completedOrders.push(order) : pendingOrders.push(order);
  });

  const returnData = {
    "completedOrders": completedOrders, 
    "pendingOrders": pendingOrders
  }

  //console.log(returnData)

  return returnData;
});

exports.completeOrder = functions.https.onCall( async (data, context) => {
  // fetch order data
  orderId = data.orderId;

  const db = admin.firestore();
  const orderRef = await db.collection('order').doc(orderId);

  return orderRef.update({
    completed: true
  }).then(function(){
    console.log("order complete successful");
  }).catch(function(error) {
    console.log("order complete error: ", error);
  });

  return returnData;
});
