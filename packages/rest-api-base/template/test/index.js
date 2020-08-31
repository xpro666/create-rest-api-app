const path = require('path');
const {expect, assert} = require('chai');
const supertest = require('supertest');

const pjson = require('../package.json');
const appName = pjson.name;

const config = require(path.join('../',`etc/${appName}/main.json`));
const api = supertest(config['base-url'] || `http://localhost:${config.http.port}`);

describe(`[Rest API] - root`, () => {
  /**
   * @swagger
   * paths:
   *  /versions:
   *    get:
   *      summary: Получение текущей версии приложения
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          schema:
   *            type: object
   *            properties:
   *              success:
   *                type: boolean
   *                example: true
   *                description: флаг результата выполнения запроса
   *              data:
   *                type: object
   *                properties:
   *                  backend:
   *                    type: string
   *                    example: "0.1.0"
   *                    description: Версия приложения
   *                  backend_int:
   *                    type: string
   *                    example: 100
   *                    description: Версия приложения перобазованная в число
   *
   */
  describe('GET /versions', () => {
    it('Получение версии приложения', async () => {
      const res = await api.get('/versions')
        .expect(200)
      expect(res.body).to.be.an('object')
      expect(res.body).to.have.all.keys('success', 'data')
      expect(res.body.success).to.be.an('boolean')
      assert(res.body.success, 'API return false in success property')
      const data = res.body.data
      expect(data).to.be.an('object')
      expect(data).to.have.all.keys('backend', 'backend_int')
      expect(data.backend).to.be.an('string')
      expect(data.backend_int).to.be.an('number')
    })
  })
})