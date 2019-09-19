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
    let results = await client.db(dbConfig.name).collection("DRG").find({drgCode: '252'}).toArray();
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
    client.close();

    return res.status(201).send(results);
});
