import { roles } from "../../middleware/auth.js"

const brandEndPoint ={
    create:[roles.Admin],
    update:[roles.Admin],
}
export default brandEndPoint