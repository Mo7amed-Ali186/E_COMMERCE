import { roles } from "../../middleware/auth.js"

const productEndPoint ={
    create:[roles.Admin,roles.User],
    update:[roles.Admin],
    delete:[roles.Admin]
}
export default productEndPoint