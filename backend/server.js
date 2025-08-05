import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRoutes from './routes/userRoute.js'
import skillrequestRoutes from './routes/skillrequestRoute.js'
import skillRoutes from './routes/skillRoute.js'

const app = express()
const port = process.env.PORT || 4000

connectDb()
connectCloudinary()


//MiddleWare
app.use(express.json());
app.use(cors())


app.get('/', (req,res)=>{
    res.send("Hello World")
})
app.use('/api/users', userRoutes)
app.use('/api/skillrequests', skillrequestRoutes)
app.use('/api/skills', skillRoutes)

app.listen(port, ()=> console.log('Server is running'))