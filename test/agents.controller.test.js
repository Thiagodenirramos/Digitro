const request = require("supertest");
const app = require("../src/server");

let idTeste = "";
if (
	("delete teste anteriores",
	async () => {
		const { body } = await request(app).get("/public/agents");
		body.map(async (item) => {
			if (
				item.login === "teste" ||
				item.login === "testealterado" ||
				item.login === "testealteradosomenteologin"
			) {
				idTeste = item.id;
				await request(app).delete(`/public/agents/${idTeste}`);
			}
		});
	})
);

it("create agent error nome", async () => {
	const response = await request(app).post("/public/agents").send({
		name: "",
		login: "teste",
	});
	expect(response.statusCode).toBe(400);
});
it("create agent error login", async () => {
	const response = await request(app).post("/public/agents").send({
		name: "teste",
		login: "",
	});
	expect(response.statusCode).toBe(400);
});

it("create agent error tudo", async () => {
	const response = await request(app).post("/public/agents").send({
		name: "",
		login: "",
	});
	expect(response.statusCode).toBe(400);
});
it("create agent success", async () => {
	const response = await request(app).post("/public/agents").send({
		name: "teste",
		login: "teste",
	});
	idTeste = response.body.id;
	expect(response.statusCode).toBe(201);
});

it("create agent erro ja existe", async () => {
	const response = await request(app).post("/public/agents").send({
		name: "teste",
		login: "teste",
	});
	expect(response.statusCode).toBe(400);
	if (response.statusCode != 400) {
		console.log(response.body);
	}
	expect(response.body).toHaveProperty("message", "Login já existe");
});

it("update agent success", async () => {
	const response = await request(app).put(`/public/agents/${idTeste}`).send({
		name: "testealterado",
		login: "testealterado",
	});
	expect(response.statusCode).toBe(200);
});

it("update agent erro id", async () => {
	const response = await request(app).put(`/public/agents/1234`).send({
		name: "testealteradoerro",
		login: "testealteradoerro",
	});
	expect(response.statusCode).toBe(404);
	expect(response.body).toHaveProperty("message", "Agente não encontrado.");
});
it("update agent alterar somente nome", async () => {
	const { nome } = await request(app).get("/public/agents/" + idTeste);

	const response = await request(app).put(`/public/agents/${idTeste}`).send({
		name: "teste alterado somente o nome",
	});
	expect(response.statusCode).toBe(200);
	expect(response.body).toHaveProperty("name", "teste alterado somente o nome");
	expect(response.body).toHaveProperty("id", idTeste);
});
it("update agent alterar somente login", async () => {
	const { login } = await request(app).get("/public/agents/" + idTeste);

	const response = await request(app).put(`/public/agents/${idTeste}`).send({
		login: "testealteradosomenteologin",
	});
	expect(response.statusCode).toBe(200);
	expect(response.body).toHaveProperty("login", "testealteradosomenteologin");
	expect(response.body).toHaveProperty("id", idTeste);
});

it("update mideas success", async () => {
	const response = await request(app)
		.put(`/public/agents/${idTeste}`)
		.send({
			medias: {
				voice: {
					min: 1,
					max: 10,
					selected: 2,
					handleMode: "AUTO",
					device: "iphone",
					devicePassword: "123456",
				},
				email: {
					min: 7,
					max: 14,
					selected: 10,
				},
				chat: {
					min: 0,
					max: 100,
					selected: 50,
					handleMode: "AUTO",
				},
			},
		});
	expect(response.statusCode).toBe(200);
});

it("update mideas success somente voice", async () => {
	const response = await request(app)
		.put(`/public/agents/${idTeste}`)
		.send({
			medias: {
				voice: {
					min: 2,
					max: 2,
					selected: 2,
					handleMode: "AUTO",
					device: "iphone 10",
					devicePassword: "12345689",
				},
			},
		});
	expect(response.statusCode).toBe(200);
});

it("update mideas success somente email min", async () => {
	const response = await request(app)
		.put(`/public/agents/${idTeste}`)
		.send({
			medias: {
				email: {
					min: 7,
				},
			},
		});
	expect(response.statusCode).toBe(200);
});

it("delete agent erro id", async () => {
	const response = await request(app).delete(`/public/agents/1234`);

	expect(response.statusCode).toBe(404);
	expect(response.body).toHaveProperty("message", "Agente não encontrado.");
});
it("delete agent success", async () => {
	const response = await request(app).delete(`/public/agents/${idTeste}`);
	expect(response.statusCode).toBe(200);
});
