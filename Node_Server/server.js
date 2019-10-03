const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const forceSsl = require('express-force-ssl');
var MongoClient = require('mongodb').MongoClient;
var distance = require('google-distance-matrix');

const dbConfig = require('./config/database.config.js');

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({ origin: '*' }));
app.use(forceSsl);

distance.key('');
distance.mode('driving');
distance.units('imperial');

const key = fs.readFileSync('pricedoctorapi.key', 'utf8');
const cert = fs.readFileSync( 'pricedoctorapiprimary.crt', 'utf8' );
const ca = fs.readFileSync( 'ca.crt', 'utf8' );

var options = {
  key: key,
  cert: cert,
  ca: ca
};

app.set('forceSSLOptions', {
  enable301Redirects: true,
  trustXFPHeader: false,
  httpsPort: 443,
  sslRequiredMessage: 'SSL Required.'
});

https.createServer(options, app).listen(443, function () {
  console.log('Server started!')
})


//app.listen(80, () => {
//    console.log('Server started!')
//});

app.get('/', (req, res) => {
    res.json({"message": "Test application for mongoDB interfacing"});
});

app.get('/api/test', (req, res) => {
    res.json({"message": "Test application for mongoDB interfacing"});
});

async function dbConnect(){
    const client = await MongoClient.connect(dbConfig.url,{useNewUrlParser:true, useUnifiedTopology: true});
    console.log('Connected...');
    const db = client.db(dbConfig.name);
return client;
}


app.get('/api/069', async (req, res) => {
    const client = await dbConnect();
    let results = await client.db(dbConfig.name).collection("DRG").find({drgCode: '069'}).toArray();
    client.close();
    res.send(results);
});

app.get('/api/252', async (req, res) => {
    const client = await dbConnect();
    // let results = await client.db(dbConfig.name).collection("DRG").find({drgCode: '003'}).sort({providerId: 1, year: 1}).toArray();
    let results = await client.db(dbConfig.name).collection("DRG").find({drgCode: '252'}).toArray();
    // var result = [];
    //console.log(results.length);
    //for(i=0; i<results.length;i++){
    //  if(i != results.length-1){
    //    if(results[i].providerId != results[i+1].providerId){
    //      result.push(results[i]);
    //      //console.log(results[i]);
    //    }
    //  }
    //}
    //result.push(results[results.length-1]);
    //console.log(results[results.length-1]);

    //console.log(result);
    client.close();
    res.send(results);
});

app.post('/api/searchDRG', async (req,res) => {
    if(!req.body.drg) {
        return res.status(400).send({
          success: 'false',
          message: 'drg code is required'
        });
    }
    const client = await dbConnect();
    let results = await client.db(dbConfig.name).collection("DRG").find({drgCode: req.body.drg}).toArray();
    // let results = await client.db(dbConfig.name).collection("DRG").find({drgCode: req.body.drg}).sort({providerId: 1, year: 1}).toArray();
    client.close();

    // console.log(results.length);
    return res.status(201).send(results);
});

app.post('/api/searchDRGLatestYear', async (req,res) => {
  if(!req.body.drg) {
      return res.status(400).send({
        success: 'false',
        message: 'drg code is required'
      });
  }

  const client = await dbConnect();
  let results = await client.db(dbConfig.name).collection("DRG").find({drgCode: req.body.drg}).sort({providerId: 1, year: 1}).toArray();

  var LatestYearResult = [];

  for(i=0; i<results.length;i++){
    if(i != results.length-1){
      if(results[i].providerId != results[i+1].providerId){
        LatestYearResult.push(results[i]);
      }
    }
  }
  LatestYearResult.push(results[results.length-1]);

  // console.log(LatestYearResult.length);
  client.close();
  res.send(LatestYearResult);
});

var userLatLon;
app.post('/api/searchDRGLatestYearWithHospitalLocationsAndFiltering', async (req,res) => {
  userLatLon = 0;
  if(!req.body.drg) {
      return res.status(400).send({
        success: 'false',
        message: 'drg code is required'
      });
  }

  const client = await dbConnect();
  let results = await client.db(dbConfig.name).collection("DRG").aggregate([{$match : {drgCode: req.body.drg}},{$sort : {providerId: 1, year: 1}},{$lookup: {from: "Hospitals", localField: "providerId", foreignField: "_id", as: "hospital"}}]).toArray();

  var LatestYearResult = [];

  for(i=0; i<results.length;i++){
    if(i != results.length-1){
      if(results[i].providerId != results[i+1].providerId){
        results[i].averageMedicareCustomerPayments = (results[i].averageTotalPayments - results[i].averageMedicarePayments);
        LatestYearResult.push(results[i]);
      }
    }
  }
  results[results.length-1].averageMedicareCustomerPayments = (results[results.length-1].averageTotalPayments - results[results.length-1].averageMedicarePayments);
  LatestYearResult.push(results[results.length-1]);

  if(req.body.priceFilter && req.body.priceFilter != "null" && req.body.priceFilter != null && req.body.priceFilter != "undefined" && req.body.priceFilter != undefined) {
    var tempArr = await applyPriceFilter(req.body.priceFilter, LatestYearResult);
    LatestYearResult = [];
    LatestYearResult = tempArr.slice(0);
    console.log("price Filter")
  }

  if(req.body.ratingFilter && req.body.ratingFilter != "null" && req.body.ratingFilter != null && req.body.ratingFilter != "undefined" && req.body.ratingFilter != undefined) {
    var tempArr = await applyRatingFilter(req.body.ratingFilter, LatestYearResult);
    LatestYearResult = [];
    LatestYearResult = tempArr.slice(0);
    console.log("rating Filter")
  }

  if(req.body.zip && req.body.zip != "null" && req.body.zip != null && req.body.zip != "undefined" && req.body.zip != undefined){
    await getUserLatLon(req.body.zip);
    var tempArr = await calculateDistance(LatestYearResult, userLatLon.lat, userLatLon.lon);
    LatestYearResult = [];
    LatestYearResult = tempArr.slice(0);
    console.log("Distance Calculation Zip Code")
  }else if((req.body.lat && req.body.lon) && (req.body.lat != "null" && req.body.lon != "null") && (req.body.lat != null && req.body.lon != null) && (req.body.lat != "undefined" && req.body.lon != "undefined") && (req.body.lat != undefined && req.body.lon != undefined)){
    var tempArr = await calculateDistance(LatestYearResult, req.body.lat, req.body.lon);
    LatestYearResult = [];
    LatestYearResult =  tempArr.slice(0);
    console.log("Distance Calculation Geolocation")
  }

  if(req.body.distanceFilter && req.body.distanceFilter != "null" && req.body.distanceFilter != null && req.body.distanceFilter != "undefined" && req.body.distanceFilter != undefined) {
    var tempArr = await applyDistanceFilter(req.body.distanceFilter, LatestYearResult);
    LatestYearResult = [];
    console.log(req.body.distanceFilter);
    LatestYearResult = tempArr.slice(0);
    console.log("distance Filter")
  }

  client.close();
  res.send(LatestYearResult);
});


function applyDistanceFilter(distance, LatestYearResult){
  tempArr = LatestYearResult.slice(0);
  LatestYearResult = [];
  if(distance == "100"){
    for(var i=0; i<tempArr.length; i++){
      if(parseFloat(tempArr[i].distance) <= 100){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(distance == "500"){
    for(var i=0; i<tempArr.length; i++){
      if(parseFloat(tempArr[i].distance) <= 500){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(distance == "1000"){
    for(var i=0; i<tempArr.length; i++){
      if(parseFloat(tempArr[i].distance) <= 1000){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(distance == "5000"){
    for(var i=0; i<tempArr.length; i++){
      if(parseFloat(tempArr[i].distance) <= 5000){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }
}


function applyPriceFilter(price, LatestYearResult){
  tempArr = LatestYearResult.slice(0);
  LatestYearResult = [];

  if(price == "smallest"){
    for(var i=0; i<tempArr.length; i++){
      if((parseFloat(tempArr[i].averageCoveredCharges) >= 0 && parseFloat(tempArr[i].averageCoveredCharges) <= 10000) || (parseFloat(tempArr[i].averageMedicareCustomerPayments) >= 0 && parseFloat(tempArr[i].averageMedicareCustomerPayments) <= 10000)){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(price == "small"){
    for(var i=0; i<tempArr.length; i++){
      if((parseFloat(tempArr[i].averageCoveredCharges) >= 10000 && parseFloat(tempArr[i].averageCoveredCharges) <= 100000) || (parseFloat(tempArr[i].averageMedicareCustomerPayments) >= 10000 && parseFloat(tempArr[i].averageMedicareCustomerPayments) <= 100000)){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(price == "medium"){
    for(var i=0; i<tempArr.length; i++){
      if((parseFloat(tempArr[i].averageCoveredCharges) >= 100000 && parseFloat(tempArr[i].averageCoveredCharges) <= 250000) || (parseFloat(tempArr[i].averageMedicareCustomerPayments) >= 100000 && parseFloat(tempArr[i].averageMedicareCustomerPayments) <= 250000)){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(price == "large"){
    for(var i=0; i<tempArr.length; i++){
      if((parseFloat(tempArr[i].averageCoveredCharges) >= 250000 && parseFloat(tempArr[i].averageCoveredCharges) <= 500000) || (parseFloat(tempArr[i].averageMedicareCustomerPayments) >= 250000 && parseFloat(tempArr[i].averageMedicareCustomerPayments) <= 500000)){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(price == "largest"){
    for(var i=0; i<tempArr.length; i++){
      if((parseFloat(tempArr[i].averageCoveredCharges) >= 500000) || (parseFloat(tempArr[i].averageMedicareCustomerPayments) >= 500000)){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }
}

function applyRatingFilter(rating, LatestYearResult){
  tempArr = LatestYearResult.slice(0);
  LatestYearResult = [];

  if(rating == "1"){
    for(var i=0; i<tempArr.length; i++){
      if(parseFloat(tempArr[i].hospital[0].rating) >= 1){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(rating == "2"){
    for(var i=0; i<tempArr.length; i++){
      if(parseFloat(tempArr[i].hospital[0].rating) >= 2){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(rating == "3"){
    for(var i=0; i<tempArr.length; i++){
      if(parseFloat(tempArr[i].hospital[0].rating) >= 3){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }else if(rating == "4"){
    for(var i=0; i<tempArr.length; i++){
      if(parseFloat(tempArr[i].hospital[0].rating) >= 4){
        LatestYearResult.push(tempArr[i])
      }
    }
    return LatestYearResult;
  }
}


////Google maps integration for calculating the distance from the user to each of the hospitals
//var tempDistanceArr = []
//function calculateDistance(LatestYearResult, userLocation,){
//  return new Promise(async resolve =>{
//    tempArr = LatestYearResult.slice(0);
//    LatestYearResult = [];
//    var destinations = [];
//    var counter = 0;
//    var counterLimit = 25;
//    var distancesGenerated = 0;
//    var limitPerSecond = 1000;
//    var arrIndex = 0;
//
//    if(tempArr.length < counterLimit){
//      counterLimit = tempArr.length;
//    }
//
//    var origins = [userLocation];
//    for(var i=0; i<tempArr.length; i++){
//      if(!(counter == counterLimit)){
//        destinations.push((tempArr[i].hospital[0].lat +"," +tempArr[i].hospital[0].lon))
//        counter++;
//      }
//
//      if(counter == counterLimit){
//        distancesGenerated = distancesGenerated+25;
//        distance.matrix(origins, destinations, function ( err, distances) {
//            return new Promise(resolve => {
//              if (err) {
//                return console.log(err);
//              }
//              if (!distances) {
//                return console.log('no distances');
//              }
//              if (distances.status == 'OK') {
//                for (var i = 0; i < origins.length; i++) {
//                  for (var j = 0; j < destinations.length; j++) {
//                    var origin = distances.origin_addresses[i];
//                    var destination = distances.destination_addresses[j];
//                    if (distances.rows[0].elements[j].status == 'OK') {
//                      var distance = distances.rows[i].elements[j].distance.text;
//                      tempDistanceArr.push(tempArr[arrIndex]);
//                      tempDistanceArr[arrIndex].distance = distance;
//                      pushToTempDistanceArr(tempDistanceArr);
//                    }
//                    else {
//                      console.log(destination + ' is not reachable by land from ' + origin);
//                    }
//                  }
//                }
//              }
//              counter = 0;
//              destinations = [];
//              resolve();
//            });
//          });
//        //console.log(distancesGenerated);
//        if(distancesGenerated == limitPerSecond){
//          distancesGenerated = 0;
//          await sleep(1000);
//        }
//
//        function sleep(ms) {
//          return new Promise(resolve => setTimeout(resolve, ms));
//        }
//      }
//    }
//    resolve();
//  });
//}

//function pushToTempDistanceArr(item){
//  tempDistanceArr.push(item);
//}

//var distDurContainerOSRM;
//var userLatLonOSRM;
//app.post('/api/getDistance', async(req, res) => {
//  if (!(req.body.hospitalLat && req.body.hospitalLon) || (!(req.body.userLat && req.body.userLon) && !req.body.userZip)) {
//      return res.status(400).send({
//          success: 'false',
//          message: 'lat/lon is required'
//      });
//  }
//  this.distDurContainer = null;
//  var osrm_url_base = "http://router.project-osrm.org/route/v1/driving/";
//  var osrm_url_options = "?alternatives=false&steps=false&overview=false";
//  var osrm_url_request;
//
//  //http://router.project-osrm.org/route/v1/driving/56.469094399999996,-2.9884416;56.7752995,-2.4252721?alternatives=false&steps=false&overview=false
//  if (!req.body.userZip) {
//    osrm_url_request = osrm_url_base + req.body.userLon + "," + req.body.userLat + ";" + hospitalLocation + osrm_url_options;
//  } else {
//    getUserLatLon(req.body.userZip);
//    osrm_url_request = osrm_url_base + userLatLonOSRM.lon + "," + userLatLonOSRM.lat + ";" + hospitalLocation + osrm_url_options;
//  }
//
//  var hospitalLocation = req.body.hospitalLon + "," + req.body.hospitalLat;
//  var self = this;
//  //osrm_url_request = osrm_url_base + userLatLon.lon + "," + userLatLon.lat + ";" + hospitalLocation + osrm_url_options;
//  request(osrm_url_request, { json: true }, (err, res) => {
//      if (!(res.body.message == "Too Many Requests")) {
//          //console.log("distance: " + res.body.routes[0].distance);
//          //console.log("Duration: " + res.body.routes[0].duration);
//          self.distDurContainerOSRM = {
//              distance: (res.body.routes[0].distance * 0.000621371192),
//              duration: (res.body.routes[0].duration / 60),
//          }
//      } else {
//          console.log("Unable to load OSRM API")
//          console.log(res.body);
//      }
//  })
//  return res.status(201).send(this.distDurContainerOSRM);
//});

var userLatLon;
function calculateDistance(LatestYearResult, userLat, userLon){
  const earthRadius = 6378.137;
  const userLatRad = convertDegToRad(userLat);
  const userLonRad = convertDegToRad(userLon);
  tempArr = LatestYearResult.slice(0);
  LatestYearResult = [];
  for(var i=0; i<tempArr.length; i++){
    var hospitalLatRad = convertDegToRad(tempArr[i].hospital[0].lat);
    var hospitalLonRad = convertDegToRad(tempArr[i].hospital[0].lon);
    var dLat = hospitalLatRad - userLatRad;
    var dLon = hospitalLonRad - userLonRad;
    var haversine = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(userLatRad) * Math.cos(hospitalLatRad) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var angle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1-haversine));
    var distance = (earthRadius * angle) * 0.621371192;  
    tempArr[i].distance = distance;
    console.log("distance", distance);
    LatestYearResult.push(tempArr[i]);
  }
  return LatestYearResult;
}

function convertDegToRad(number){
  return (number * (Math.PI/180));
}



function getUserLatLon(zipcode) {
  console.log(zipcode);
  var self = this;
  var userZip = zipcode;
  var baseUrl = "http://nominatim.openstreetmap.org/search?countrycodes=us&postalcode=";
  var urlOptions = "&format=json";
  var requestUrl = baseUrl + userZip + urlOptions;
  return new Promise(function(resolve, reject) {
    request(requestUrl, { json: true }, (err, res) => {
        var temp = res.body

        if (!(temp.length <= 0)) {
          self.userLatLon = {
              lat: res.body[0].lat,
              lon: res.body[0].lon,
          }

          userLatLon = self.userLatLon;
          resolve(self.userLatLon);
        }
    });
  });  
}


app.post('/api/locationLookup', async (req,res) => {
  if(!req.body.zip) {
      return res.status(400).send({
        success: 'false',
        message: 'zip code is required'
      });
  }
  
  await getUserLatLon(req.body.zip);
  var userLocation = {
    lat: userLatLon.lat,
    lon: userLatLon.lon,
  }
  
  return res.status(201).send(userLocation);
});











app.post('/api/addNewCondition', async function(req,res){
  const client = await dbConnect();
  console.log("inserting");
  let results = await client.db(dbConfig.name).collection("DRG").insertOne(req.body);
  res.status(201).send(results);
  client.close();
})
