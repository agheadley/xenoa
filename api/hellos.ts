export default (request,response) => {
  //let name = request.body.name;
  //response.status(200).json({results:`Hello ${name}!`});
  response.status(200);
  response.json({ message: 'It works',body:'Hello from vercel!'});
};