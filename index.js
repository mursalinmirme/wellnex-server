const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIP_SECRET_API);
const port = process.env.PORT || 5000;
app.use(cors({
  
}))
app.use(express.json())


app.get('/', (req, res) => {
    res.send('The Wellnex server is running.....');
})


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
    const wellnessBlogsCollection = client.db('wellnex').collection('wellness_blogs');
    const joinCampRegCollection = client.db('wellnex').collection('join_camp_registrations');
    const paymentCollection = client.db('wellnex').collection('payments');
    const reviewCollection = client.db('wellnex').collection('reviews');
    const bannersCollection = client.db('wellnex').collection('banners');
    const upcommingCampRegCollection = client.db('wellnex').collection('upcommingCampRegistrations');
    const professionalInterestCollection = client.db('wellnex').collection('professionalsInterset');


    // custom middlewares
    const verifyToken = (req, res, next) => {
        const token = req.headers.token;
        if(!token){
          return res.status(401).send({msg: 'Unauthorized access'});
        }
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
          if(err){
           return res.status(401).send({msg: 'Unauthorized'})
          }
          req.decoded = decoded;
          next();
        })
    }

    // generate a token
    app.post('/jwt', async(req, res) => {
       const email = req.body;
       console.log(email);
       const token = jwt.sign(email, process.env.SECRET_KEY, {expiresIn: '90d'});
       res.send({token: token});
    })

    app.get('/banners', async(req, res) => {
       const result = await bannersCollection.find().toArray();
       res.send(result);
    })


    // insert users registration data
    app.post('/users', async(req, res) => {
        const usersData = req.body;
        const inserUser = await usersCollection.insertOne(usersData);

        console.log(inserUser);
    })


    // popular camps relate
    // get camps
    app.get('/popular-camps', async(req, res) => {
      const popularCampsResult = await campsCollection.find().sort({total_participants: -1}).skip(0).limit(6).toArray();
      res.send(popularCampsResult);
    })
    // single camps detalis
    app.get('/camps-details/:id', verifyToken, async(req, res) => {
      const campId = req.params;
      const query = {_id: new ObjectId(campId)}
      const findCampResult = await campsCollection.findOne(query);
      res.send(findCampResult)
    } )
    // upcomming camp details camps detalis
    app.get('/upcomming-camps-details/:id', verifyToken, async(req, res) => {
      const campId = req.params;
      const query = {_id: new ObjectId(campId)}
      const findCampResult = await UpCommingcampsCollection.findOne(query);
      res.send(findCampResult)
    } )


    // ratting related api
    // participant ratings
    app.get('/participants_ratings', async(req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })


    // upcomming camps related

    app.get('/upcomming-camps', async(req, res) => {
      const result = await UpCommingcampsCollection.find().sort({_id: -1}).toArray();
      res.send(result);
    })


    // all available camps
    app.get('/all_camps', verifyToken, async(req, res) => {
      const result = await campsCollection.find().sort({_id: -1}).toArray();
      res.send(result);
    })

    // wellness blogs related
    app.get('/wellness-blogs', async(req, res) => {
      const result = await wellnessBlogsCollection.find().toArray();
      res.send(result);
    })

    // registrations camps api
    app.post('/join-camp-reg', verifyToken, async(req, res) => {
      const getJoinData = req.body;
      const result = await joinCampRegCollection.insertOne(getJoinData);

      const getRegCamp = getJoinData.campInfo.camp_id;

      const getTotalParticipant = await campsCollection.findOne({_id: new ObjectId(getRegCamp)}, {projection: {total_participants: 1}});

      const updateTotalParticipant = await campsCollection.updateOne({_id: new ObjectId(getRegCamp)}, {$set: {total_participants: getTotalParticipant.total_participants + 1}})
      res.send(updateTotalParticipant);
    })
    // registrations up comming camps api
    app.post('/join-upcomming-camp-reg', verifyToken, async(req, res) => {
      const getJoinData = req.body;
      const result = await upcommingCampRegCollection.insertOne(getJoinData);

      const getRegCamp = getJoinData.campInfo.camp_id;

      const getTotalParticipant = await UpCommingcampsCollection.findOne({_id: new ObjectId(getRegCamp)}, {projection: {total_participants: 1}});

      const updateTotalParticipant = await UpCommingcampsCollection.updateOne({_id: new ObjectId(getRegCamp)}, {$set: {total_participants: getTotalParticipant.total_participants + 1}})
      res.send(updateTotalParticipant);
    })
    // parofessional interest submission for up comming camps api
    app.post('/professionall-interest-submit-upcomming', verifyToken, async(req, res) => {
      const getJoinData = req.body;
      const result = await professionalInterestCollection.insertOne(getJoinData);

      const getRegCamp = getJoinData.campInfo.camp_id;

      const getTotalInterest = await UpCommingcampsCollection.findOne({_id: new ObjectId(getRegCamp)}, {projection: {total_interests: 1}});

      const updateTotalParticipant = await UpCommingcampsCollection.updateOne({_id: new ObjectId(getRegCamp)}, {$set: {total_interests: getTotalInterest.total_interests + 1}})
      res.send(updateTotalParticipant);
    })

    // search camps
    app.get('/search-camps', async(req, res) => {
      console.log('someone hitting this routes');
      const get = req.query;
    })

    // current user role
    app.get('/user/:email', async(req, res) => {
      const query = req.params;
      const findUser = await usersCollection.findOne(query);
      res.send({userRole: findUser?.role});
    })

    // get users details
    app.get('/users', async(req, res) => {
      const query = req.query;
      const result = await usersCollection.findOne(query);
      res.send(result)
    })

    // update organizer information
    app.put('/users/:email', async(req, res) => {
      const updateEmail = req.params;
      const updateInfo = req.body;
      const filter = {email: updateEmail?.email};
      const option = { upsert: true }
      const updateDoc = {
        $set: updateInfo
      }
      const result = await usersCollection.updateOne(filter, updateDoc, option)
      res.send(result)
    })

    // organizer add a new camp post
    app.post('/add-a-camp', async(req, res) => {
       const getnewcamp = req.body;
       const result = await campsCollection.insertOne(getnewcamp);
       res.send(result);
    })
    // organizer add a new upcomming camp post
    app.post('/add-a-upcomming-camp', async(req, res) => {
       const getnewcamp = req.body;
       const result = await UpCommingcampsCollection.insertOne(getnewcamp);
       res.send(result);
    })

    // organizers saved camps
    app.get('/organizers-camps', verifyToken, async(req, res) => {
      const query = req.query;
      const result = await campsCollection.find({campOwnerEmail: query?.email}).toArray();
      res.send(result)
    })

    // organizers camps delete 
    app.delete('/organizers-camps/:id', async(req, res) => {
      const deleteId = req.params;
      console.log(deleteId);
      const result = await campsCollection.deleteOne({_id: new ObjectId(deleteId.id)});
      res.send(result);
    })

    // get organizers update camps details
    app.get('/organizers-camps/:id', async(req, res) => {
      const campId = req.params.id;
      console.log(campId);
      const result = await campsCollection.findOne({_id: new ObjectId(campId)});
      console.log(result);
      res.send(result);
    })
    // update camps
    app.put('/organizers-camps/:id', async(req, res) => {
      const updateId = req.params;
      const updateInfo = req.body;
      console.log(updateId);
      const filter = {_id: new ObjectId(updateId)};
      const option = { upsert: true }
      const updateDoc = {
        $set: updateInfo
      }
      const result = await campsCollection.updateOne(filter, updateDoc, option)
      res.send(result)
    })

    // get all registration under a organizer
    app.get(`/registered_under_organizers`, async(req, res) => {
      const organizerEmail = req.query?.email;
      // console.log('orga ni zer is', organizerEmail);
      const option = {
        sort: {_id: 1},
        projection: { _id:1, 'campInfo.camp_name':1, 'campInfo.scheduled_date_time':1, 'campInfo.venue_location':1,'campInfo.camp_fees':1, payment_status:1, confirmation_stauts:1, }
      }
      const result = await joinCampRegCollection.find({'campInfo.camp_owner': organizerEmail}, option).toArray();
      // console.log('Mr Rahat got', result);
      res.send(result);
    })

    // get all registration under a organizer
    app.get(`/get-upcomming-camps-under-organizer`, async(req, res) => {
      const organizerEmail = req.query?.email;
      // console.log('orga ni zer is', organizerEmail);
      const result = await UpCommingcampsCollection.find({campOwnerEmail: organizerEmail}).toArray();
      // console.log('Mr Rahat got', result);
      res.send(result);
    })

    // confiremed participant registrantion update
    app.patch('/payment-status/:id', async(req, res) => {
      const regId = req.params.id;
      const result = await joinCampRegCollection.findOneAndUpdate({_id: new ObjectId(regId)}, {$set: {confirmation_stauts:'Confirmed'}}, {new: true});
      console.log(result);
      if(result){
        res.send({operatonStatus: 'success'})
      }
    })

    // organizers can delete participant registration
    app.delete('/participant-register-camp/:id', async(req, res) => {
      const deleteId = req.params;
      const result = await joinCampRegCollection.deleteOne({_id: new ObjectId(deleteId.id)});
      res.send(result);
    })

    // participant dahboard related routes
    app.get(`/participant-registered-camps`, verifyToken, async(req, res) => {
      const participantEmail = req.query?.email;
      // console.log('orga ni zer is', organizerEmail);
      const option = {
        sort: {_id: 1},
        projection: { _id:1, 'campInfo.camp_name':1, 'campInfo.scheduled_date_time':1, 'campInfo.venue_location':1,'campInfo.camp_fees':1, payment_status:1, confirmation_stauts:1, }
      }
      const result = await joinCampRegCollection.find({participantEmail: participantEmail}, option).toArray();
      // console.log('Mr Rahat got', result);
      res.send(result);
    })

    // stripe payment intregation here
    app.post("/create-payment-intent", async (req, res) => {
      const {price}  = req.body;
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(price * 100),
        currency: "usd",
        payment_method_types: ['card']
      });
    
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });


    // payment card details get
    app.get('/cart-camp-details/:id', verifyToken, async(req, res) => {
      const detilsId = req.params.id;
      // console.log(detilsId);
      const result = await joinCampRegCollection.findOne({_id: new ObjectId(detilsId)});
      // console.log(result);
      res.send(result);
    })

    app.post('/payments', async(req, res) => {
      const paymentDesc = req.body;
      const result = await paymentCollection.insertOne(paymentDesc);
      res.send(result);
    })

    app.patch('/update_reg_camps_payment_status/:id', async(req, res) => {
      const updateId = req.params;
      const result = await joinCampRegCollection.findOneAndUpdate({_id: new ObjectId(updateId?.id)}, {$set: {payment_status:'paid'}}, {new: true});
      if(result){
        res.send({updateSuccessfully: 'success'})
      }
    })

    // get perticipant payment list
    app.get('/participant-payment-history', verifyToken, async(req, res) => {
        const partiEmail = req.query;
        const option = {
          sort: {_id: 1},
          projection: { _id:1, camp_name:1, scheduled_date_time:1, venue_location:1,camp_fees:1, payment_status:1, confirmation:1, }
        }
        const result = await paymentCollection.find({paymentUser: partiEmail?.email}).toArray();
        res.send(result);
    })

    // get all paid camps of a specific user for only paid registered camps
    app.get('/participants-reviewable-camps', verifyToken, async(req, res) => {
      const {email} = req.query;
      const result = await joinCampRegCollection.find({participantEmail: email, payment_status: 'paid', confirmation_stauts: 'Confirmed'}).toArray();
      res.send(result);
    })

    // get camp name 
    app.get('/review-cam-name/:id', async(req, res) => {
       const objId = req.params.id;
       const result = await joinCampRegCollection.findOne({_id: new ObjectId(objId)}, {projection: {'campInfo.camp_name': 1}});
       res.send(result)
    })

    // give perticipant review
    app.post('/participant-review', async(req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      console.log(newReview);
      res.send(result);
    })

    // update professionals medical specility
    app.put('/update-medical-specility', async(req, res) => {
      const updateEmail = req.query.email;
      const value = req.body.specility;
      console.log(updateEmail, value);
      const result = await usersCollection.updateOne({email: updateEmail}, {$set: {specility: value}})
      res.send(result);
    })
    // update professionals medical specility
    app.put('/upload-certificate', async(req, res) => {
      const updateEmail = req.query.email;
      const value = req.body.certificateImg;
      console.log(updateEmail, value);
      const result = await usersCollection.updateOne({email: updateEmail}, {$set: {certificateImg: value}})
      res.send(result);
    })

    // get a specific perticipents registrations under a camp
    app.get('/upcomming-camps-under-participants/:id', async(req, res) => {
      const getUpCampsId = req.params.id;
      const result = await upcommingCampRegCollection.find({'campInfo.camp_id': getUpCampsId}).toArray();
      res.send(result);
    })
    // get a specific perticipents registrations under a camp
    app.get('/upcomming-camps-under-professionals/:id', async(req, res) => {
      const profId = req.params.id;
      const result = await professionalInterestCollection.find({'campInfo.camp_id': profId}).toArray();
      res.send(result);
    })

    app.get('/professionals-requesting', async(req, res) => {
      const professionalEmail = req.query.email;
      console.log('hahahah', professionalEmail);
      const result = await professionalInterestCollection.find({professionalEmail: professionalEmail}).toArray();
      res.send(result)
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







