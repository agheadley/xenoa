
import { VercelRequest, VercelResponse } from "@vercel/node";

module.exports = (request: VercelRequest, response: VercelResponse) => {
  console.log('api/hello',request.body.name);
  let name = request.body.name;
  response.status(200);
  response.json({ message: 'It works',body:JSON.stringify(request.body.name)});
};



/*
export default {
  fetch(request:VercelRequest) {
      let name = request.body.name;
    return new Response('Hello from Vercel!');
  },
};
  */
