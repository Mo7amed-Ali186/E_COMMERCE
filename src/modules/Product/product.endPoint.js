import { roles } from "../../middleware/auth.js"

const productEndPoint ={
    create:[roles.Admin],
    update:[roles.Admin],
}
export default productEndPoint