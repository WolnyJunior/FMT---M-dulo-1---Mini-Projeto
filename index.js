const express = require('express')
const yup = require('yup')
const app = express();

const PORT = 3000;
app.use(express.json())

const listaProdutos = []

//Esquema de validação de dados usando YUP
const schema = yup.object().shape({
    nome: yup.string().required(),
    preco: yup.number().positive().required(),
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

//Rota OPTIONS para listar as opções de manipulação
app.options('/produtos', registroChamada, (req, res) => {
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.status(200).send();
});

//Rota POST para adicionar um produto
app.post('/produto', registroChamada, validarDados, (req, res) => {
    const produto = req.body;
    produto.id = listaProdutos.length > 0 ? listaProdutos[listaProdutos.length - 1].id + 1 : 1;
    listaProdutos.push(produto)
    res.status(201).send(`Novo produto adicionado ao estoque com sucesso.\n\nProduto: ${produto.nome}\nPreço: ${produto.preco}\nDescrição: ${produto.descricao}`)
})

//Rota GET para listar os produtos
app.get('/listar', registroChamada, (req, res) => {

    //Se a lista estiver sem nenhum item, retorna uma mensagem
    if (listaProdutos == 0) {
        res.status(404).json({ message: 'Nenhum produto dentro da lista do estoque.' })
        return
    }
    // Retornar a lista de produtos em formato JSON
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
    if (!newData.nome || !newData.preco || !newData.descricao) {
        res.status(400).json({ message: 'Todos os campos (nome, preço, descrição) são obrigatórios' });
        return
    }
    if (typeof newData.preco !== 'number' || newData.preco <= 0) {
        res.status(400).json({ message: 'O preco deve ser um número positivo.' });
        return
    }
    listaProdutos[index] = { ...listaProdutos[index], ...newData }
    res.status(200).send(`Produto atualizado com sucesso.`)
})

//Rota para atulaizar um item parcialmente, através do ID
app.patch('/atualizar/:id', registroChamada, (req, res) => {
    const { id } = req.params
    const atualizacao = req.body
    const index = listaProdutos.findIndex(produto => produto.id == parseInt(id))
    if (index == -1) {
        res.status(404).json({ message: 'Produto não encontrado' })
        return
    }
    listaProdutos[index] = { ...listaProdutos[index], ...atualizacao };
    res.status(200).json({ message: 'Produto atualizado parcialmente.', produto: atualizacao })
})

//Rota para deletar um produto através do ID
app.delete("/excluir/:id", registroChamada, (req, res) => {
    const { id } = req.params
    const index = listaProdutos.findIndex(produto => produto.id == parseInt(id))
    if (index == -1) {
        res.status(404).send("Produto não encontrado.")
        return
    }
    listaProdutos.splice(index, 1)
    res.status(200).send("Produto deletado com sucesso.")
})

app.listen(PORT, () => {
    console.log(`Servidor rodando primeiro mini-projeto em http://localhost${PORT}`)
})