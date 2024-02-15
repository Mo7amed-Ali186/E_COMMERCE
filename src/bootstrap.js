import { globalError } from "./utils/errorHandler.js";
import {connection} from"../DB/connection.js";
import authRouter from './modules/auth/auth.routes.js'
import categoryRouter from'./modules/category/category.routes.js'
import subCategoryRouter from'./modules/category/category.routes.js'
import couponRouter from'./modules/coupon/coupon.routes.js'
import brandRouter from'./modules/brand/brand.routes.js'
import productRouter from'./modules/Product/product.routes.js'
import cartRouter from'./modules/Cart/cart.routes.js'
import orderRouter from './modules/Order/order.routes.js'
export function bootstrap(app,express){
    connection()
    app.use(express.json())
    app.use('/uploads',express.static('uploads'))
    app.use('/auth',authRouter)
    app.use('/category',categoryRouter)
    app.use('/subcategory',subCategoryRouter)
    app.use('/coupon',couponRouter)
    app.use('/brand',brandRouter)
    app.use('/product',productRouter)
    app.use('/cart',cartRouter)
    app.use('/order',orderRouter)
    app.use('*',(req,res,next)=>{
        return res.json({ message: "Invalid Request"});
    })
     app.use(globalError)
}


