
export default {
  fetch (request, response) {
    let name = request.body.name;
    response.status(200);
    response.json({ message: 'It works',body:JSON.stringify(request.body.name)});
  }
};


