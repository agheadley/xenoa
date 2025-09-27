
export default {
  fetch (request) {
    let name = request.body.name;
    return new Response(JSON.stringify(request.body));
  }
};


