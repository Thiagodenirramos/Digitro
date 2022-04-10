const fs = require('fs');
const crypto = require("crypto");
module.exports = {
    async getAgents(req, res) {
        const agents = await fs.readFileSync('./db/agents.json', 'utf8');
        res.json(JSON.parse(agents));
    },
    async getAgent(req, res) {
        const agent = await fs.readFileSync('./db/agents.json', 'utf8');
        const agentId = req.params.id;
        const agentJson = JSON.parse(agent);
        const agentData = agentJson.find(agent => agent.id == agentId);
        if (agentId == undefined || agentData == '' || agentData == null) {
            return res.status(404).send('Agente não encontrado');
        }
        if (agentData) {
            return res.json(agentData);
        } else {
            return res.status(404).send('Agente não encontrado');
        }
    },
    async createAgent(req, res) {
        const agent = await fs.readFileSync('./db/agents.json', 'utf8');
        const agentJson = JSON.parse(agent);
        const agentData = req.body;
        let { name, login, medias, domain } = agentData
        let erro = {}
        if (!domain) {
            domain = 'padrão';
        }

        let mediaPadrao = {
            voice: {
                min: 0,
                max: 0,
                selected: 0,
                handleMode: "AUTO",
                device: "",
                devicePassword: ""
            },
            email: {
                min: 0,
                max: 0,
                selected: 0
            },
            chat: {
                min: 0,
                max: 0,
                selected: 0,
                handleMode: "AUTO"
            }
        }
        if (medias) {
            medias = {
                voice: {
                    min: medias.voice?.min ?? mediaPadrao.voice.min,
                    max: medias.voice?.max ?? mediaPadrao.voice.max,
                    selected: medias.voice?.selected ?? mediaPadrao.voice.selected,
                    handleMode: medias.voice?.handleMode ?? mediaPadrao.voice.handleMode,
                    device: medias.voice?.device ?? mediaPadrao.voice.device,
                    devicePassword: medias.voice?.devicePassword ?? mediaPadrao.voice.devicePassword
                },
                email: {
                    min: medias.email?.min ?? mediaPadrao.email.min,
                    max: medias.email?.max ?? mediaPadrao.email.max,
                    selected: medias.email?.selected ?? mediaPadrao.email.selected
                },
                chat: {
                    min: medias.chat?.min ?? mediaPadrao.chat.min,
                    max: medias.chat?.max ?? mediaPadrao.chat.max,
                    selected: medias.chat?.selected ?? mediaPadrao.chat.selected,
                    handleMode: medias.chat?.handleMode ?? mediaPadrao.chat.handleMode
                }
            }

        }

        if (typeof name !== 'string' || !name) {
            erro.name = 'O nome inválido';
        }
        if (typeof login !== 'string' || !login ) {
            erro.login = 'O login inválido';
        }

        if (erro.name || erro.login) {
            res.status(400).json({ message: 'Dados inválidos', erro });
        } else {
            let password = crypto.createHash('sha512');
            password.update(name + login);
            password = password.digest('hex');

            let id = crypto.createHash('sha256');
            id.update(login)
            id = id.digest('hex');

            const exist = agentJson.find(agent => agent.login == login);
            if (exist) {
                res.status(400).json({ message: 'Login já existe' });
            } else {
                agentJson.push({ name, login, medias, password, id, domain });
                await fs.writeFileSync('./db/agents.json', JSON.stringify(agentJson), 'utf8');
                res.status(201).json({ name, login, medias, password, id, domain });
            }
        }
    },
    async updateAgent(req, res) {
        const agent = await fs.readFileSync('./db/agents.json', 'utf8');
        const agentJson = JSON.parse(agent);
        const agentId = req.params.id;
        const agentData = req.body;

        let { name, login, medias, domain } = agentData
        const exist = agentJson.find(agent => agent.login == login);
        if (exist) {
            res.status(400).json({ message: 'Login já existe para outro usuario.' });
        } else {
            const agentData = agentJson.find(agent => agent.id == agentId);
            let mediaPadrao = {
                voice: {
                    min: 0,
                    max: 0,
                    selected: 0,
                    handleMode: "AUTO",
                    device: "",
                    devicePassword: ""
                },
                email: {
                    min: 0,
                    max: 0,
                    selected: 0
                },
                chat: {
                    min: 0,
                    max: 0,
                    selected: 0,
                    handleMode: "AUTO"
                }
            }
            if (medias) {
                medias = {
                    voice: {
                        min: medias.voice?.min ?? mediaPadrao.voice.min,
                        max: medias.voice?.max ?? mediaPadrao.voice.max,
                        selected: medias.voice?.selected ?? mediaPadrao.voice.selected,
                        handleMode: medias.voice?.handleMode ?? mediaPadrao.voice.handleMode,
                        device: medias.voice?.device ?? mediaPadrao.voice.device,
                        devicePassword: medias.voice?.devicePassword ?? mediaPadrao.voice.devicePassword
                    },
                    email: {
                        min: medias.email?.min ?? mediaPadrao.email.min,
                        max: medias.email?.max ?? mediaPadrao.email.max,
                        selected: medias.email?.selected ?? mediaPadrao.email.selected
                    },
                    chat: {
                        min: medias.chat?.min ?? mediaPadrao.chat.min,
                        max: medias.chat?.max ?? mediaPadrao.chat.max,
                        selected: medias.chat?.selected ?? mediaPadrao.chat.selected,
                        handleMode: medias.chat?.handleMode ?? mediaPadrao.chat.handleMode
                    }
                }
    
            }
            if (agentData) {
                let agentUpdate
                agentJson.map(agent => {
                    if (agent.id == agentId) {
                        agent.name = name ?? agent.name;
                        agent.login = login ?? agent.login;
                        agent.medias = medias ?? agent.medias;
                        agent.domain = domain ?? agent.domain ?? 'padrão';
                        agentUpdate = agent;
                    }
                })
                await fs.writeFileSync('./db/agents.json', JSON.stringify(agentJson), 'utf8');
                res.status(200).json({ message: 'Agente atualizado com sucesso.', ...agentUpdate });
            } else {
                res.status(404).json({ message: 'Agente não encontrado.' });
            }
        }
    },
    async deleteAgent(req, res) {
        const agent = await fs.readFileSync('./db/agents.json', 'utf8');
        const agentJson = JSON.parse(agent);
        const agentId = req.params.id;
       
        if (!agentId) {
            return res.status(400).json({ message: 'Agente não encontrado.' });
        }
        const agentIndex = agentJson.findIndex(agent => agent.id == agentId);
        if (agentIndex == -1) {
            return res.status(404).json({ message: 'Agente não encontrado.' });
        }
        agentJson.splice(agentIndex, 1);
        await fs.writeFileSync('./db/agents.json', JSON.stringify(agentJson));
        res.json(agentJson);
    }
}
