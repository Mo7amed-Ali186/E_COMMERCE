import { roles } from "../../middleware/auth.js"

const categoryEndPoint ={
    create:[roles.Admin],
    update:[roles.Admin],
}
export default categoryEndPoint