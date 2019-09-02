const findFreePort = require('find-free-port')
const fetch = require('node-fetch');
const http = require('http');
const express = require('express');

const { MemoryStrategy } = require('../../strategies');
const createShopifyAuthRouter = require('../shopifyAuth');

const PORT = 3025;
const BASE_URL = `http://localhost:${PORT}`

let server;
let afterAuthSpy;
describe('shopifyAuth', async () => {
  beforeEach(async () => {
    afterAuthSpy = jest.fn();

    server = await createServer(afterAuthSpy);
  });

  afterEach(() => {
    server.close();
  });

  describe('/', () => {
    it('responds to get requests by returning a redirect page', async () => {
      const response = await fetch(`${BASE_URL}/?shop=shop1`);
      const data = await response.text();

      expect(response.status).toBe(200);
      expect(data).toMatchSnapshot();
    });

    it('responds with a 400 when no shop query parameter is given', async () => {
      const response = await fetch(BASE_URL);
      const data = await response.text();

      expect(response.status).toBe(400);
      expect(data).toMatchSnapshot();
    });
  });
});

function createServer(afterAuth) {
  const app = express();

  app.use(
    '/',
    createShopifyAuthRouter({
      apiKey: 'key',
      secret: 'secret',
      scope: ['scope'],
      shopStore: new MemoryStrategy(),
      afterAuth,
    }),
  );

  server = http.createServer(app);

  return new Promise((resolve, reject) => {
    findFreePort(PORT, (err, freePort) => {
      if (err) {
        throw err;
      }
      server.listen(PORT, resolve(server));
    })
  });
}
