const express = require('express')
const app = express()
const cors =require('cors');
require("dotenv").config();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = "mongodb+srv://electronic-web-holder:ZRYtyReZs1jWv7Vj@cluster0.xm07hcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xm07hcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("RepairRanger");
    const servicesCollection = database.collection("services");
    const bookedServiceCollection = database.collection("bookedService");
    app.get('/', (req, res) => {
      res.send('RepairRanger')
    })
    
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/services/:id", async (req, res) => {
     const id = req.params.id;
     const quary = {_id: new ObjectId(id)}
      const result =await servicesCollection.findOne(quary);
    console.log(id);
      res.send(result);
    });
    app.delete("/services/service/delete/:id", async (req, res) => {
     const id = req.params.id;
     const quary = {_id: new ObjectId(id)}
      const result =await servicesCollection.deleteOne(quary);
      res.send(result); 
    });
    app.get("/services/service/:email", async (req, res) => {
     const email = req.params.email;
     const quary = {providerEmail:email}
      const result =await servicesCollection.find(quary).toArray();
      res.send(result);
    });
    app.post("/services", async (req, res) => {
      const services = req.body;
      const result = await servicesCollection.insertOne(services);
      res.send(result);
      console.log(services);
    });
    // Send a ping to confirm a successful connection
    app.post("/services/service/booked-service", async (req, res) => {
      const services = req.body;
      const result = await bookedServiceCollection.insertOne(services);
      res.send(result);
      console.log(services);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});