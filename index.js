const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('The Wellnex server is running.....');
})

console.log(process.env.USER_NAME);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@mursalin.bxh3q56.mongodb.net/?retryWrites=true&w=majority`;

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
    const usersCollection = client.db('wellnex').collection('users');
    const campsCollection = client.db('wellnex').collection('camps');
    const UpCommingcampsCollection = client.db('wellnex').collection('upcomming_camps');
    const participantRatingsCollection = client.db('wellnex').collection('participant_ratings')
    const wellnessBlogsCollection = client.db('wellnex').collection('wellness_blogs');
    const joinCampRegCollection = client.db('wellnex').collection('join_camp_registrations');

    // insert users registration data
    app.post('/users', async(req, res) => {
        const usersData = req.body;
        const inserUser = await usersCollection.insertOne(usersData);

        console.log(inserUser);
    })


    // popular camps relate
    // get camps
    app.get('/popular-camps', async(req, res) => {
      const popularCampsResult = await campsCollection.find().toArray();
      res.send(popularCampsResult);
    })
    // single camps detalis
    app.get('/camps-details/:id', async(req, res) => {
      const campId = req.params;
      console.log(campId);
      const query = {_id: new ObjectId(campId)}
      const findCampResult = await campsCollection.findOne(query);
      res.send(findCampResult)
    } )


    // ratting related api
    // participant ratings
    app.get('/participants_ratings', async(req, res) => {
      const result = await participantRatingsCollection.find().toArray();
      res.send(result);
    })


    // upcomming camps related

    app.get('/upcomming-camps', async(req, res) => {
      const result = await UpCommingcampsCollection.find().toArray();
      res.send(result);
    })


    // all available camps
    app.get('/all_camps', async(req, res) => {
      const result = await campsCollection.find().toArray();
      res.send(result);
    })

    // wellness blogs related
    app.get('/wellness-blogs', async(req, res) => {
      const result = await wellnessBlogsCollection.find().toArray();
      res.send(result);
    })

    // registrations camps api
    app.post('/join-camp-reg', async(req, res) => {
      const getJoinData = req.body;
      const result = await joinCampRegCollection.insertOne(getJoinData);
      res.send(result);
    })





    client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`The current port ${port} is running now.`)
})







