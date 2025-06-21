//const itens = JSON.parse(localStorage.getItem("listaDeCompras")) || [] // Busca os items do localStorage, e, se não existirem itens, retorna um array vazio

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

        return dados || [] // Retorna os itens e, se não existirem itens, retorna um array vazio
    } catch (error) {
        console.error("Erro na requisição:", error.message)
        return []
    }
}

const renderizarStats = async () => {
    const loader = document.getElementById("loader")
    const stats = document.getElementById("stats")

    // Mostra o loader e limpa a lista
    if (loader) loader.style.display = "block"

    // Aguarda carregamento (simulação de tempo mínimo opcional)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Busca os itens da API
    const itens = await carregarLista()

    const total = itens.length; // Define o total de itens pelo tamanho do array
    const comprados = itens.filter(item => item.comprado).length // Filtra a quantidade de itens e comprados e calcula a quantidade
    const pendentes = total - comprados // Calcula, com uma subtração simples, o total de itens pendentes/não comprados
    
    document.getElementById("total").textContent = total // Mostra o total de itens na página
    document.getElementById("comprados").textContent = comprados // Mostra o total de itens comprados na página
    document.getElementById("pendentes").textContent = pendentes // Mostra o total de itens pendentes na página

    // Oculta o loader ao final
    if (loader) loader.style.display = "none"

    if (stats) stats.style.display = "block"
}

renderizarStats()

document.getElementById("btnVoltar").addEventListener("click", () => {
    location.href = "index.html" // Quando o botão de voltar para a lista é clicado, o location.href retorna para a página inicial da aplicação
})