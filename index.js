const express  = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const app  = express()
const port= process.env.PORT || 5000

app.use(express.json())
app.use(cors())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ip0tsyu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 
async function run(){
    try{
        const userCollection = client.db('pushpaliResell').collection('users')
        const categoryCollection = client.db('pushpaliResell').collection('categories')

        app.post('/users', async(req, res)=>{
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)
        })
        app.post('/categories', async(req, res)=>{
            const user = req.body
            const result = await categoryCollection.insertOne(user)
            res.send(result)
        })

        app.get('/users', async(req, res)=>{
            const queary = {}
            const result = await userCollection.find(queary).toArray()
            res.send(result)
        })
        app.get('/categories', async(req, res)=>{
            const queary = {}
            const result = await categoryCollection.find(queary).toArray()
            res.send(result)
        })
    }
    finally{

    }
}

run().catch(console.log)

app.get('/', async(req,res)=>{
    res.send('Pushpali server is running')
})

app.listen(port,()=>{
    console.log(`Pushpali surver is running on ${port}`);
})

