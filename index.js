const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = "mongodb+srv://electronic-web-holder:ZRYtyReZs1jWv7Vj@cluster0.xm07hcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xm07hcd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors:  true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("RepairRanger");
    const servicesCollection = database.collection("services");
    const bookedServiceCollection = database.collection("bookedService");
    const CommentCollection = database.collection("comment");
    app.get("/", (req, res) => {
      res.send("RepairRanger");
    });

    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // for to get length total data

    app.get("/service/services-count", async (req, res) => {
      const count = await servicesCollection.estimatedDocumentCount();
      res.send({ count });
    });

    //  for pagination
    app.get("/all-servicefilter", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page);
      const cursor = servicesCollection
        .find()
        .skip(size * page)
        .limit(size);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(quary);
      res.send(result);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(quary);
      res.send(result);
    });
    app.delete("/services/service/delete/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await servicesCollection.deleteOne(quary);
      res.send(result);
    });
    app.get("/services/service/:email", async (req, res) => {
      const email = req.params.email;
      const quary = { providerEmail: email };
      const result = await servicesCollection.find(quary).toArray();
      res.send(result);
    });
    app.post("/services", async (req, res) => {
      const services = req.body;
      const result = await servicesCollection.insertOne(services);
      res.send(result);
    });
    app.put("/services/update/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const services = req.body;

      update_data = {
        $set: {
          description: services.description,
          imgURL: services.imgURL,
          price: services.price,
          providerEmail: services.providerEmail,
          providerImage: services.providerImage,
          providerName: services.providerName,
          serviceArea: services.serviceArea,
          serviceName: services.serviceName,
        },
      };
      const result = await servicesCollection.updateOne(quary, update_data);
      res.send(result);
      console.log(services);
    });
    // Send a ping to confirm a successful connection
    app.post("/services/service/booked-service", async (req, res) => {
      const services = req.body;
      const result = await bookedServiceCollection.insertOne(services);
      res.send(result);
    });
    app.get("/services/service/booked-service/:email", async (req, res) => {
      const email = req.params.email;
      const quary = { userEmail: email };
      const result = await bookedServiceCollection.find(quary).toArray();
      res.send(result);
    });
    app.get(
      "/services/service/booked-service/too-service/:email",
      async (req, res) => {
        const email = req.params.email;
        const quary = { providerEmail: email };
        const result = await bookedServiceCollection.find(quary).toArray();
        res.send(result);
      }
    );

    app.patch(
      "/services/service/booked-service/too-service/update/:id",
      async (req, res) => {
        const id = req.params.id;
        const status = req.body;
        const quary = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: status,
        };
        const result = await bookedServiceCollection.updateOne(
          quary,
          updateDoc
        );

        res.send(result);
      }
    );
    app.get("/services/service/booked-service/", async (req, res) => {
      const cursor = bookedServiceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // comment route
    app.post("/comments", async (req, res) => {
      const { text, commentID } = req.body;
      try {
        const result = await CommentCollection.insertOne({
          text,
          commentID,
          replies: [],
        });
        res.status(201).json(result.ops[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Route to post a reply to a comment
    app.post("/comments/:commentId/replies", async (req, res) => {
      const { commentId } = req.params;
      const { text } = req.body;
      try {
        const result = await CommentCollection.updateOne(
          { _id: new ObjectId(commentId) },
          { $push: { replies: { text } } }
        );
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Route to get all comments with their replies
    app.get("/comments/:id", async (req, res) => {
      console.log(req.params.id);
      try {
        const comments = await CommentCollection.find({
          commentID: req.params.id,
        }).toArray();
        res.json(comments);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.delete("/comments/delete/deleteitem/del/:id", async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await CommentCollection.deleteOne(quary);
      res.send(result);
      console.log(id);
    });

    //  serch -------------------------
    // Server side
    // app.get('/services/service/booked-service', async (req, res) => {
    //       const filter = req.query.search;
    //       const searchResults = await servicesCollection.find({
    //           serviceName: { $regex: new RegExp(filter, 'i') } // Case-insensitive search
    //       }).toArray();
    //       res.send(searchResults);
    //       console.log(filter);

    // });

    app.get("/services/search-datas/search-data/data", async (req, res) => {
      try {
        const search = req.query.search;
        const query = {
          serviceName: { $regex: search, $options: "i" },
        };
        const options = {}; // Options object can be empty if no special options are needed

        const result = await servicesCollection.find(query, options).toArray(); // Convert the cursor to an array to send as response
        res.send(result);
      } catch (error) {
        console.error("Error searching services:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
