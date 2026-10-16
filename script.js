let allCryptos = [];
let currentCurrency = 'usd';

const searchInput = document.getElementById('search-input');
const currencySelect = document.getElementById('currency-select');
const updateStatus = document.getElementById('update-status');
const priceHeader = document.getElementById('price-header');

const currencySymbols = {
    usd: '$',
    brl: 'R$',
    eur: '€'
};

async function fetchCryptos(isBackgroundUpdate = false) {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=20&page=1&sparkline=false`;
    
    try {
        if (isBackgroundUpdate) {
            updateStatus.textContent = 'A atualizar...';
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar dados da API');
        }
        
        allCryptos = await response.json();
        
        const searchTerm = searchInput.value.toLowerCase();
        const filteredCryptos = allCryptos.filter(coin => 
            coin.name.toLowerCase().includes(searchTerm) || 
            coin.symbol.toLowerCase().includes(searchTerm)
        );

        renderTable(filteredCryptos);

        updateStatus.textContent = 'Atualizado agora';
        setTimeout(() => {
            updateStatus.textContent = 'Em direto';
        }, 3000);

    } catch (error) {
        console.error('Falha na requisição:', error);
        updateStatus.textContent = 'Erro na atualização';
    }
}

function renderTable(cryptos) {
    const tableBody = document.getElementById('crypto-table-body');
    tableBody.innerHTML = '';
    
    priceHeader.textContent = `Preço (${currentCurrency.toUpperCase()})`;
    const symbol = currencySymbols[currentCurrency];

    if (cryptos.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8;">Nenhuma criptomoeda encontrada.</td></tr>`;
        return;
    }

    cryptos.forEach((coin, index) => {
        const isPositive = coin.price_change_percentage_24h >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeSign = isPositive ? '+' : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="coin-info">
                    <img src="${coin.image}" alt="${coin.name}">
                    <span><strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})</span>
                </div>
            </td>
            <td>${symbol} ${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td class="${changeClass}">${changeSign}${coin.price_change_percentage_24h.toFixed(2)}%</td>
            <td>${symbol} ${coin.market_cap.toLocaleString('en-US')}</td>
        `;
        tableBody.appendChild(row);
    });
}

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCryptos = allCryptos.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm) || 
        coin.symbol.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredCryptos);
});

currencySelect.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    searchInput.value = '';
    fetchCryptos();
});

fetchCryptos();

setInterval(() => {
    fetchCryptos(true);
}, 30000);