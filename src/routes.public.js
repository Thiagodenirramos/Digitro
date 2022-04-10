const { Router } = require("express");
const agentsController = require("./controller/agents.controller");

const router = Router();

router.get("/healthy", (req, res) => {
  try {
    res.status(200).send("Ok.");
    
  } catch (error) {
    res.status(200).send("Erro interno do servidor.");
    
  }
});
router.get("/public/agents", agentsController.getAgents);
router.get("/public/agents/:id", agentsController.getAgent);
router.post("/public/agents", agentsController.createAgent);
router.put("/public/agents/:id", agentsController.updateAgent);
router.delete("/public/agents/:id", agentsController.deleteAgent);




module.exports = router;
