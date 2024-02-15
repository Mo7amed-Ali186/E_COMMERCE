import express from 'express'
import * as dotenv from'dotenv'
import path  from 'path';
import { bootstrap } from './src/bootstrap.js'
import cors from 'cors'
// import createInvoice from './src/utils/pdfInvoice.js';
const app = express()
// var whitelist = ['http://example1.com/', 'http://example2.com/']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions))
// if(process.env.MOOD=='dev'){
//   app.use(cors())
// }else{
//   app.use(async (req,res,next)=>{
//       if(!whitelist.includes(req.header('origin'))){
//           return next(new Error("Not allowed by CORS",{cause:502}))
//       }
//       await res.header('Access-Control-Allow-Origin','')
//       await res.header('Access-Control-Allow-Header','')
//       await res.header('Access-Control-Allow-Private-Network','true')
//       await res.header('Access-Control-Allow-Method','*')
//       next()
//   })
// }
dotenv.config({path:path.resolve('./config/.env')})
const port = +process.env.PORT;
bootstrap(app,express)

app.listen(port, () => console.log(`E_Commerce listening on port ${port}!`))