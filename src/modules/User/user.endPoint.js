import { roles } from "../../middleware/auth.js";

const userEndPoint = {
create: [roles.Admin],
	update: [roles.Admin],
	delete: [roles.Admin],
};
export default userEndPoint;
