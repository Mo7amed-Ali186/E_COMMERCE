// import  Mongoose from 'mongoose'

// export const connection  = async ()=>{
//     return await Mongoose.connect(process.env.URI)
//     .then((result)=>{
//         console.log(" DB Connected Successfully on ..............")
//     }).catch(error=>{
//         console.log("Fail in Connection");
//     })
// }

import Mongoose from 'mongoose';

export const connection = async () => {
    try {
        await Mongoose.connect(process.env.URI, {
            // bufferCommands: false, // Disable command buffering
            bufferTimeoutMS: 0,    // Set buffer timeout to 0ms
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Other connection options...
        });
        console.log("DB Connected Successfully on ..............");
    } catch (error) {
        console.error("Failed to connect to the database:", error);
    }
};
