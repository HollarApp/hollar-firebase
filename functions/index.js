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

  console.info("-------storeID: " + storeId);

  const db = admin.firestore();
  const querySnapshot = await db.collection('order').where("storeID", "==", storeId).get();

  var orders = [];
  var completedOrders = [];
  var pendingOrders = [];

  querySnapshot.forEach(function(doc){
    console.info("-----doc: " + JSON.stringify(doc));
    var tempOrder = {...doc.data()};
    tempOrder["orderID"] = doc.id;
    console.info("------doc.id: " + doc.id);

    orders.push(tempOrder);
    console.info("-----orders: ", orders);
  });
  console.info("-----collected all matching order");
  orders.forEach((order, index) => {
    order.completed ? completedOrders.push(order) : pendingOrders.push(order);
  });
  console.info("---completed length: " + completedOrders.length);
  console.info("---pending length: " + pendingOrders.length);

  const returnData = {
    "completedOrders": completedOrders, 
    "pendingOrders": pendingOrders, 
    "orders": orders
  };
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
