const express  = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');

require('dotenv').config()

const app  = express()
const port= process.env.PORT || 5000

app.use(express.json())
app.use(cors())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ip0tsyu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 
function verifyJWT(req, res, next){
    const authHeader = req.headers?.authoraization

    if(!authHeader){
        res.status(401).send('Unauthoraize access')
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({ message:'Forbidden Access'})
        }
        req.decoded = decoded
        next()
    })
}

async function run(){
    try{
        const userCollection = client.db('pushpaliResell').collection('users')
        const categoryCollection = client.db('pushpaliResell').collection('categories')
        const productsCollection = client.db('pushpaliResell').collection('products')

        const verifyBuyer = async (req, res, next)=>{
            const decodedEmail = req.decoded.email
            const query = {email: decodedEmail}

            const user = await userCollection.findOne(query)
            if(user.role !== "buyer"){
                return res.status(403).send({ message:'Forbidden Access'})
            }
            next()
        }
        const verifyAdmin = async (req, res, next)=>{
            const decodedEmail = req.decoded.email
            const query = {email: decodedEmail}

            const user = await userCollection.findOne(query)
            if(user.role !== "admin"){
                return res.status(403).send({ message:'Forbidden Access'})
            }
            next()
        }
        const verifySeller = async (req, res, next)=>{
            const decodedEmail = req.decoded.email
            const query = {email: decodedEmail}

            const user = await userCollection.findOne(query)
            if(user.role !== "seller"){
                return res.status(403).send({ message:'Forbidden Access'})
            }
            next()
        }
        
        app.put('/users', async(req, res)=>{
            const user = req.body
            console.log(user);
            const filter = {email:user.email}
            const updateDoc = {
                $set: {
                    name: user.name,
                    email:  user.email,
                    photoURL: user.photoURL,
                    role: user.role
                },
              };
            const options = { upsert: true };
            const result = await userCollection.updateOne(filter,updateDoc,options)
            res.send(result)
        })
        app.get('/jwt', async(req,res)=>{
            const email = req.query.email
            const query = {email:email}
            const user = await userCollection.findOne(query)
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN,{
                    expiresIn:'10h',

                })
                res.send({
                    accessToken : token
                })

            }
            else{
                return res.status(403).send({accessToken:''})
            }
        })


        app.post('/categories', async(req, res)=>{
            const category = req.body
            const result = await categoryCollection.insertOne(category)
            res.send(result)
        })


        app.post('/products', verifyJWT, async(req, res)=>{
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.send(result)
        })

        app.get('/products', async(req, res)=>{
            const queary = {}
            const result = await productsCollection.find(queary).toArray()
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
        app.get('/category/:name', async(req,res)=>{
            const name = req.params.name
            const query = {
                category: name
            }

            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })
    }
    finally{

    }
}

run().catch(console.log)

app.get('/', async(req,res)=>{
    res.send({
        Server: 'Pushpali',
        Stattus:'ok',    
    })
})

app.listen(port,()=>{
    console.log(`Pushpali surver is running on ${port}`);
})

