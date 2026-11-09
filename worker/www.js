// www.ahmedalsalman.dev → https://ahmedalsalman.dev, keeping the path and query.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'ahmedalsalman.dev';
    return Response.redirect(url.toString(), 301);
  },
};
