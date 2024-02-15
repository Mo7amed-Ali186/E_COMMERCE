import { roles } from "../../middleware/auth.js"

const couponEndPoint ={
    create:[roles.Admin],
    update:[roles.Admin],
}
export default couponEndPoint