const express = require('express')
const yup = require('yup')
const app = express();

const PORT = 3000;
app.use(express.json())

const listaProdutos = []

//Esquema de validação de dados usando YUP
const schema = yup.object().shape({
    nome: yup.string().required(),
    preco: yup.number().positive().integer().required(),
    descricao: yup.string().required()
})

//Middleware para validação de dados
const validarDados = async (req, res, next) => {
    const { body } = req;
    try {
        await schema.validate(body, { abortEarly: false });
        next();
    } catch (erro) {
        res.status(400).json({ erro: erro.errors + ' - Necessário preencher todos os campos com dados do produto' })
    }
}

//Middleware para registrarinformações de cada chamada realizada
const registroChamada = (req, res, next) => {
    const horaAtual = new Date().toLocaleString();
    console.log(`Chamada tipo ${req.method}, registrada em:[${horaAtual}]. Através da URL: ${req.originalUrl}`);
    next();
}

//Rota POST para adicionar um produto
app.post('/produto', registroChamada, validarDados, (req, res) => {
    const produto = req.body;
    produto.id = listaProdutos.length > 0 ? listaProdutos[listaProdutos.length - 1].id + 1 : 1;
    listaProdutos.push(produto)
    res.status(201).send(`Novo produto adicionado ao estoque com sucesso.\n\nProduto: ${produto.nome}\nPreço: ${produto.preco}\nDescrição: ${produto.descricao}`)
})

//Rota GET para listar os produtos
app.get('/listar', registroChamada, (req, res) => {
    res.json(listaProdutos)
})

//Rota para atualizar um produto através do ID
app.put("/atualizar/:id", registroChamada, (req, res) => {
    const { id } = req.params
    const newData = req.body
    const index = listaProdutos.findIndex(produto => produto.id == parseInt(id))
    if (index == -1) {
        res.status(404).send("Produto não encontrado.")
        return
    }
    listaProdutos[index] = { ...listaProdutos[index], ...newData }
    res.status(200).send(`Produto atualizado com sucesso.`)
})

//Rota para deletar um produto através do ID
app.delete("/excluir/:id", registroChamada, (req, res)=>{
    const { id } = req.params
    const index = listaProdutos.findIndex(produto => produto.id == parseInt(id))
    if (index == -1) {
        res.status(404).send("Usuário não encontrado.")
        return
    }
    listaProdutos.splice(index, 1)
    res.status(200).send("Usuário deletado com sucesso.")

})

app.listen(PORT, () => {
    console.log(`Servidor rodando primeiro mini-projeto em http://localhost${PORT}`)
})
