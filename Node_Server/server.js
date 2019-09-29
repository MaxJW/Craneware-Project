const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var MongoClient = require('mongodb').MongoClient;

const dbConfig = require('./config/database.config.js');

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({ origin: '*' }));

app.listen(8000, () => {
    console.log('Server started!')
});

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


app.post('/api/searchDRGLatestYearWithHospitalLocationsAndFiltering', async (req,res) => {
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

  if(req.body.distanceFlter && req.body.distanceFlter != "null" && req.body.ratingFilter != null && req.body.ratingFilter != "undefined" && req.body.ratingFilter != undefined) {
    var tempArr = await applyDistanceFilter(req.body.distanceFlter, LatestYearResult);
    LatestYearResult = [];
    LatestYearResult = tempArr.slice(0);
    console.log("distnace Filter")
  }

  if(req.body.priceFilter && req.body.priceFilter != "null" && req.body.ratingFilter != null && req.body.ratingFilter != "undefined" && req.body.ratingFilter != undefined) {
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


  client.close();
  res.send(LatestYearResult);
});


function applyDistanceFilter(distance, LatestYearResult){
  tempArr = LatestYearResult.slice(0);
  LatestYearResult = [];
  for(var i=0; i<tempArr.length; i++){
    //if(parseFloat(tempArr[i].averageCoveredCharges) || parseFloat(tempArr[i].averageMedicareCustomerPayments))
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








app.post('/api/addNewCondition', async function(req,res){
  const client = await dbConnect();
  console.log("inserting");
  await client.db(dbConfig.name).collection("DRG").insertOne(req.body);
  res.send('Data received:\n' + JSON.stringify(req.body));
  client.close();
})
