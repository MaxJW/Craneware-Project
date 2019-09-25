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

app.post('/api/addNewCondition', function(req,res){
  var data = {
    drgCode: req.body.drgCode,
    drgDefinition: req.body.drgDefinition,
    providerId: req.body.providerId,
    providerName: req.body.providerName,
    providerStreetAddress: req.body.providerStreetAddress,
    providerCity: req.body.providerCity,
    providerState: req.body.providerState,
    providerZipCode: req.body.providerZipCode,
    hospitalReferralRegionHRRDesciption: req.body.hospitalReferralRegionHRRDesciption,
    totalDischarges: req.body.totalDischarges,
    averageCoveredCharges: req.body.averageCoveredCharges,
    averageTotalPayments: req.body.averageTotalPayments,
    averageMedicarePayments: req.body.averageMedicarePayments,
    year: req.body.year
  }

  const client = await dbConnect();
  let results = await client.db(dbConfig.name).collection("DRG").insertOne(data, function(err, result){
    console.log("data has been inserterd")
    client.close();
  });
})
