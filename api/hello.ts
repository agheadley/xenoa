export default async function handler(req, res) {
  const { body } = req;

  console.log(body);
  return res.send(`Hello ${body.name}, you just parsed the request body!`);
}