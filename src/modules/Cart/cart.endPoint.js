import { roles } from "../../middleware/auth.js"

const cartEndPoint ={
    create:[roles.User],
    update:[roles.User],
}
export default cartEndPoint