
import { VercelRequest, VercelResponse } from "@vercel/node";

module.exports = (request: VercelRequest, response: VercelResponse) => {
   let name = request.body.name;
  response.status(200);
  response.json({ message: 'It works',body:JSON.stringify(request.body.name)});
};


