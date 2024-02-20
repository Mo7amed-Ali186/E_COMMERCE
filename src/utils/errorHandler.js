// export const asyncHandler = (fun) => {
//   return (req, res, next) => {
//       fun(req, res, next).catch(error => {
//           return next(new Error(error, { cause: 500 }))
//       });
//   };
// };

// export const globalError = (error, req, res, next) => {
//   if (req.validationResult && req.validationResult.details) {
//     return res.status(error.cause || 400).json({ globalMessage: error.message, details: req.validationResult.details });
//   }
//   if (process.env.MOOD === 'DEV') {
//     return res.status(error.cause || 500).json({ globalMessage: error.message, stack: error.stack });
//   }
//   return res.status(error.cause || 500).json({ globalMessage: error.message });
// };


export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      return next(new Error(error,{cause:500}))
    });
  };
};

export const globalError = (error, req, res, next) => {
 
  if(req.validationResult){

    return res.status(error.status500).json({ message: error.message,details:req.validationResult.details });
  }
  if (process.env.MOOD == "dev") {
    return res.status(error.status500).json({ message: error.message, stack: error.stack });
  }
  return res.status(error.status||500).json({ message: error.message });
};