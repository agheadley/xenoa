
export default {
  fetch (request) {
    let name = request.name;
    return new Response(JSON.stringify(request.name));
  }
};


