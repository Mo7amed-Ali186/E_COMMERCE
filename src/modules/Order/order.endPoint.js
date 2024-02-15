import { roles } from "../../middleware/auth.js"

const orderEndPoint ={
    create:[roles.User],
    cancel:[roles.User],
    rejected:[roles.User],
    delivered:[roles.User]//change to admin

}
export default orderEndPoint