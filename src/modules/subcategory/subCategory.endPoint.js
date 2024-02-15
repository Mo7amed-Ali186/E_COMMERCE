import { roles } from "../../middleware/auth.js"

const subCategoryEndPoint ={
    create:[roles.Admin],
    update:[roles.Admin],
}
export default subCategoryEndPoint