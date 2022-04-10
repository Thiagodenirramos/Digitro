const request = require('supertest');
const app = require('../src/server');


describe("Testando a aplicação", ()=> {    
    it("Verificando se a api esta online", async ()=> {
        const response = await request(app).get("/healthy");
        expect(response.statusCode).toBe(200);
    });
});