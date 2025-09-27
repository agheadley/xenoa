import type { VercelRequest, VercelResponse } from '@vercel/node';

export default (request: VercelRequest, response: VercelResponse) => {
  let name = request.body.name;
  response.status(200);
  response.json({ message: 'It works',body:JSON.stringify(request.body.name)});
};