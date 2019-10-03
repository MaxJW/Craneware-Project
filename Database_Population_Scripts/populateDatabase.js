const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const dbConfig = require('./config/database.config.js');

async function dbConnect(){
    const client = await MongoClient.connect(dbConfig.url,{useNewUrlParser:true, useUnifiedTopology: true});
    console.log('Connected...');
    const db = client.db(dbConfig.name);
return client;
}

async function populateDatabase()
{
    const client = await dbConnect();
    client.db(dbConfig.name).collection("Hospitals");
   // db.collection("procedures");
   
    console.log('Populating...');

    let unique_hospitals = new Map();
    let fileData = fs.readFileSync('DRGChargesData.json');
    let data = JSON.parse(fileData);

    for(i=0; i < data.length; i++)
    {
        if(data[i].providerId == ""){
            continue;
        }

        if(data[i].providerId.charAt(0) == '0'){
            data[i].providerId = data[i].providerId.substring(1,6);
        }

        if(data[i].providerStreetAddress == 'ONE HOSPITAL DRIVE, ROOM CE121, DC031,00'){
            data[i].providerStreetAddress = 'ONE HOSPITAL DRIVE';
        }


        if(!unique_hospitals.has(data[i].providerId))
        {
            var hospitalData = {
                _id : data[i].providerId,
                providerName : data[i].providerName,
                providerStreetAddress : data[i].providerStreetAddress, 
                providerCity : data[i].providerCity, 
                providerState : data[i].providerState,
                providerZipCode : data[i].providerZipCode,
                hospitalReferralRegionHRRDescription : data[i].hospitalReferralRegionHRRDescription                  
            };
            unique_hospitals.set(data[i].providerId, "");
            await client.db(dbConfig.name).collection("Hospitals").insertOne(hospitalData);
        }
    }
    console.log("Complete");
    process.exit(0);
}

populateDatabase();