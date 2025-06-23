// Busca os itens do banco, e, se não existirem itens, retorna um array vazio
async function carregarLista() {
    try {
        const resposta = await fetch("http://localhost:5000/itens", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!resposta.ok) {
            throw new Error(`Erro ao buscar itens: ${resposta.status}`)
        }

        const dados = await resposta.json()

        return dados || []
    } catch (error) {
        console.error("Erro na requisição:", error.message)
        return []
    }
}

// Salva a lista no banco após converter para string JSON
async function salvarItem(item) {
    try {
        const resposta = await fetch("http://localhost:5000/itens", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })

        if (!resposta.ok) {
            throw new Error(`Erro ao adicionar itens: ${resposta.status}`)
        }

        const dados = await resposta.json()

        console.log("Item adicionado com sucesso!", dados)
    } catch (error) {
        console.error("Erro na requisição:", error.message)
    }
}

// Edita o item desejado com a requisição PUT no banco
async function editarItem(id, novoItem) {
    try {
        const resposta = await fetch(`http://localhost:5000/itens/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoItem)
        })

        if (!resposta.ok) {
            throw new Error(`Erro ao adicionar itens: ${resposta.status}`)
        }

        const dados = await resposta.json()

        console.log("Item editado com sucesso!", dados)
    } catch (error) {
        console.error("Erro na requisição:", error.message)
    }
}

//Remove o item do banco com a requisição DELETE
async function removerItem(item) {
    try {
        const resposta = await fetch(`http://localhost:5000/itens/${item.id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!resposta.ok) {
            throw new Error("Erro ao deletar item.", resposta.status)
        }

        const dados = await resposta.json()

        console.log(dados)
    } catch (error) {
        console.error(error)
    }
}

//Muda o status do item para comprado, e, se ele já estiver comprado, muda para não comprado
async function comprarItem(item) {
    if (!item.comprado) {
        try {
            const resposta = await fetch(`http://localhost:5000/itens/${item.id}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    comprado: true
                })
            })

            if (!resposta.ok) {
                throw new Error("Erro ao comprar item.", resposta.status)
            }

            const dados = await resposta.json()

            console.log("Item comprado com sucesso!", dados)
        } catch (error) {
            console.error(error)
        }
    } else {
        try {
            const resposta = await fetch(`http://localhost:5000/itens/${item.id}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    comprado: false
                })
            })

            if (!resposta.ok) {
                throw new Error("Erro ao comprar item.", resposta.status)
            }

            const dados = await resposta.json()

            console.log("Item comprado com sucesso!", dados)
        } catch (error) {
            console.error(error)
        }
    }
}

// Renderiza todos os itens da lista na tela
async function renderizarLista() {
  const loader = document.getElementById("loader")
  const listaUl = document.getElementById("listaDeItens")

  // Mostra o loader e limpa a lista
  if (loader) loader.style.display = "block"
  listaUl.innerHTML = ""

  // Aguarda carregamento (simulação de tempo mínimo opcional)
  await new Promise(resolve => setTimeout(resolve, 500))

  // Busca os itens da API
  const itens = await carregarLista()

  // Renderiza os itens
  itens.forEach((item, index) => {
    const li = document.createElement("li")
    li.className = "list-group-item d-flex justify-content-between align-items-center"

    const span = document.createElement("span")
    span.textContent = item.nome
    if (item.comprado) span.classList.add("comprado")
    span.style.cursor = "pointer"
    span.addEventListener("click", () => {
      comprarItem(item)
    })

    const botoes = document.createElement("div")

    //Cria o botão de editar item da lista
    const btnEditar = document.createElement("button")
    btnEditar.innerHTML = "Editar"
    btnEditar.className = "btn text-black"
    btnEditar.title = "Editar"
    btnEditar.addEventListener("click", () => editar(item, index))

    //Cria o botão de remover item da lista
    const btnExcluir = document.createElement("button")
    btnExcluir.innerHTML = "Excluir"
    btnExcluir.className = "btn btn-gold"
    btnExcluir.title = "Excluir"
    btnExcluir.addEventListener("click", async () => {
      if (confirm("Deseja excluir este item?")) {
        await removerItem(item)
        await renderizarLista()
      }
    })

    //Coloca botões no setor certo
    botoes.appendChild(btnEditar)
    botoes.appendChild(btnExcluir)

    //Adiciona todos os elementos ao HTML
    li.appendChild(span)
    li.appendChild(botoes)
    listaUl.appendChild(li)
  })

  // Oculta o loader ao final
  if (loader) loader.style.display = "none"
}

// Função chamada quando o botão "Editar" é clicado
async function editar(item, index) {
    const listaUl = document.getElementById("listaDeItens")
    const li = listaUl.children[index] // Pega o elemento de lista correspondente

    // Cria campo de input para edição
    const inputEdicao = document.createElement("input")
    inputEdicao.type = "text"
    inputEdicao.className = "form-control"
    inputEdicao.value = item.nome // Preenche com o nome atual

    li.innerHTML = "" // Limpa o elemento de lista
    li.appendChild(inputEdicao)
    inputEdicao.focus() // Coloca o cursor no input

    // Salva ao clicar fora do input
    inputEdicao.addEventListener("blur", salvarEdicao)

    // Salva ao pressionar Enter
    inputEdicao.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            salvarEdicao()
        }
    })

    // Função que salva a nova versão do nome
    async function salvarEdicao() {
        const novoNome = inputEdicao.value.trim()
        if (novoNome === "") {
            alert("Nome inválido.")
            renderizarLista() // Volta sem salvar
            return
        }
        const novoItem = {
            nome: novoNome,
            comprado: item.comprado
        }
        await editarItem(item.id, novoItem) //Edita o item
        await renderizarLista()
    }
}

// Ao submeter o formulário de adicionar item
document.getElementById("formAdicionarItem").addEventListener("submit", async (e) => {
    e.preventDefault() // Evita recarregar a página

    const input = document.getElementById("inputItem")
    const nome = input.value.trim() // Remove espaços em branco

    if (nome === "") {
        alert("Digite um nome válido para o item.")
        return
    }

    const item = { nome, comprado: false } // Adiciona novo item
    await salvarItem(item) // Salva
    await renderizarLista() // Atualiza tela

    input.value = "" // Limpa campo
    input.focus() // Foco de volta no campo
})

// Botão "Limpar Lista"
document.getElementById("limparLista").addEventListener("click", async () => {
    if (confirm("Deseja limpar toda a lista?")) {
        const lista = await carregarLista() //Puxa a lista do banco
        const deletarTodos = lista.map(async (item)=>{
            const resposta = await fetch(`http://localhost:5000/itens/${item.id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!resposta.ok) {
                throw new Error(`Erro ao remover item: ${resposta.status}`)
            }

            const dados = await resposta.json()

            console.log("Removido: ", dados)
        }) // Deleta todos os itens da lista com um array.map

        try {
            await Promise.all(deletarTodos)
            await renderizarLista()
        } catch (error) {
            console.error("Erro ao remover itens:", error.message)
        } // Executa a remoção
    }
})

// Botão "Ver Estatísticas"
document.getElementById("btnEstatisticas").addEventListener("click", () => {
    location.href = "stats.html" // Vai para a página de estatísticas
})

// Inicializa a tela com a lista carregada
renderizarLista()