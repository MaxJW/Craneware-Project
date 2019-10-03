const MongoClient = require('mongodb').MongoClient;
const googleMapsClient = require('@google/maps').createClient({
    key: '< INSERT API KEY HERE >'
  });

const dbConfig = require('./config/database.config.js');

async function dbConnect(){
    const client = await MongoClient.connect(dbConfig.url,{useNewUrlParser:true, useUnifiedTopology: true});
    console.log('Connected...');
    const db = client.db(dbConfig.name);
return client;
}

var idAndLocation = [];
geolocation = [];
globalHospitalID = [];
globalHosptialIndex = 0;
function getAddress(hospital)
{
    return hospital.providerName + ", " +  hospital.providerStreetAddress + ", " + hospital.providerCity + ", " + hospital.providerState + " " + hospital.providerZipCode;
}

async function populateLatLons()
{
    const client = await dbConnect();
    const NoOfHospitals = await client.db(dbConfig.name).collection("Hospitals").countDocuments();
    const NoOfLoops = Math.ceil(NoOfHospitals / 50);

    console.log('Processing...');

    for(var i=0; i < NoOfLoops; i++){
        const results = await client.db(dbConfig.name).collection("Hospitals").find().skip((i * 50)).limit(50).toArray(); //skip remembers where to start the query from

        var hospitalIds = [];
        var hospitalAddresses = [];
        geolocation.length = 0;

        for(var j=0; j < results.length; j++)
        {
            var hospitalAddress = getAddress(results[j]);
            hospitalIds.push(results[j]._id);
            hospitalAddresses.push(hospitalAddress);
        }
        globalHospitalID = hospitalIds.slice(0);
        console.log(hospitalAddresses);
        const coordinates = await getLatLong(hospitalAddresses, hospitalIds);
        await sleep(5000);

        for(var k=0; k < geolocation.length; k++)
        {
            await client.db(dbConfig.name).collection("Hospitals").updateOne({ _id : geolocation[k].id }, { $set : { lat : geolocation[k].lat , lon : geolocation[k].lon, rating : geolocation[k].rating } }, (err , collection) => {
                if(err) throw err;
            });
        }//
        console.log("Processed: " + (i * 50) + "/" + NoOfHospitals);
        console.log("Waiting");
        await sleep(5000);
        console.log("Resumed");
    }

    function sleep(time) {
        return new Promise(res => setTimeout(res, time));
      }
}

async function getLatLong(addresses,hospitalIds)
{
    loop = 0;
    for(i=0; i<addresses.length; i++){
        console.log(i);
        var request = {
            query: addresses[i]
        };
        await googleMapsClient.places(request, function(err, res) {
           if(err){
               console.log(err);
           }
            hospital = {
                id : hospitalIds[loop],
                lat : res.json.results[0].geometry.location.lat,
                lon : res.json.results[0].geometry.location.lng,
                rating : res.json.results[0].rating
            }
            geolocation.push(hospital);
            loop++;
        });
        await sleep(500);
    }
    function sleep(time) {
        return new Promise(res => setTimeout(res, time));
      }
}

populateLatLons();