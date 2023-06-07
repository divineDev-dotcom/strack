$('.searchBtn').click(function(e) {
  e.preventDefault();
  let userInput = $('.searchCode').val()
  $('.searchCode').val('')
  chart(userInput);
  fetchStockPrice(userInput);
})

const apiKey = 'c3ibusiad3ib8lb82nbg'

function fetchStockPrice (symbol) {
  symbol = symbol.toUpperCase();
  var stockPriceApi = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
  fetch(stockPriceApi)
  .then(res => {
    return res.json()
  })
  .then(data => {
    if(data.c === 0 && data.h === 0) {
      return;
    } else {
      var stockArray = JSON.parse(localStorage.getItem("stockSymbol"));
      if (stockArray === null) {
        stockArray = [];
        stockArray.push(symbol);
        localStorage.setItem('stockSymbol', JSON.stringify(stockArray))
        buildMarqueeButton(symbol)
      } else if (!stockArray.includes(symbol)) {
          stockArray.push(symbol)
          localStorage.setItem('stockSymbol', JSON.stringify(stockArray))
          buildMarqueeButton(symbol)
      } else {
      }

      let currentPrice = accounting.formatMoney(data.c)
      let openPrice = accounting.formatMoney(data.o)
      let lowPrice = accounting.formatMoney(data.l)
      let highPrice = accounting.formatMoney(data.h)
      let prevPrice = accounting.formatMoney(data.pc)
      displayCurrentStockInfo(symbol,currentPrice, openPrice, lowPrice, highPrice, prevPrice)
    }
    })
}

function displayCurrentStockInfo(symbol, currentPrice, openPrice, lowPrice, highPrice, prevPrice){
 document.getElementsByClassName('stock-heading')[0].innerText = `${symbol}`;
 document.getElementsByClassName('current-price')[0].innerText = `Current price: ${currentPrice}`;
 document.getElementsByClassName('open')[0].innerHTML = `Open price: ${openPrice}`;
 document.getElementsByClassName('low')[0].innerHTML = `Low price: ${lowPrice}`;
 document.getElementsByClassName('high')[0].innerHTML = `High price: ${highPrice}`;
 document.getElementsByClassName('previous-close')[0].innerHTML = `Previous price: ${prevPrice}`;
}

function fetchNews() {
  var bussinessNewsApi = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
  fetch(bussinessNewsApi)
  .then(res => {
    return res.json()
  })
  .then(data => {
    for(var i = 0; i < 4; i++) {
    let headline = data[i].headline;
    let imageUrl = data[i].image;
    let url = data[i].url;
    let summary = data[i].summary

    var $headlineEl = $("<p>").addClass("title headline is-size-4").text(headline);
    var $summaryEl = $("<p>").addClass("summary is-size-6").text(summary);
    var $articleEl = $("<article>").addClass("tile is-child box");
    var $cardEl = $("<div>").addClass("tile is-parent cardItem").attr("url", url);

    $cardEl.click(function (){
    var cardLink =  $(this).attr("url")
    window.open(cardLink);
    })

    $articleEl.append($headlineEl, $summaryEl);
    $cardEl.append($articleEl);
    $(".article-section").append($cardEl);
    }
  })
}
fetchNews()

function chart(symbol) {
  var currentUnix =Math.round(new Date().getTime()/1000);
  var dateInUnix10DayAgo = currentUnix - (86400 * 20)
  
  var stockCandlesApi = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${dateInUnix10DayAgo}&to=${currentUnix}&token=${apiKey}`
  fetch(stockCandlesApi)
  .then(res => {
    return res.json();
  })
  .then(data => {
    if(data.s !== 'no_data') {
      if(window.myChart instanceof Chart){
        window.myChart.destroy();
      }
      let timeSlot = data.t
      let realDate = timeSlot.map(time => {
        return new Date(time * 1000).toLocaleDateString("en-US")
      })
      buildChart(symbol,data.o, realDate)
    } else {
      let $invalidMsg = $('.invalid-msg')
        $invalidMsg.text('Invalid Stock Symbol')
        setTimeout(() => {
          $invalidMsg.text('')
        },700)
    }
  })
}

function buildChart(symbol,priceArray, dateArray) {
  let labels = dateArray;

  let data = {
    labels: labels,
    datasets: [{
      label: symbol.toUpperCase(),
      backgroundColor: '#ff00cc',
      borderColor: '#ff00cc',
      data: priceArray,
    }]
  };

  const config = {
    type: 'line',
    data,
    options: {}
  };

  window.myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
}

function buildMarqueeButton (sym) {
  sym = sym.toUpperCase()
  let historyBtnEl = $('<button>').addClass('stockToWatch history-btn mx-1').text(sym).attr('id', sym)

  historyBtnEl.click(function() {
    chart(sym);
    fetchStockPrice(sym);
  })

  $('marquee').append(historyBtnEl)
}

function initHistoryButton () {
  var localStorageData = JSON.parse(localStorage.getItem("stockSymbol"));
  if(localStorageData !== null) {
    localStorageData.forEach(symbol => {
      buildMarqueeButton(symbol)
    })
  }
}
initHistoryButton()

$('.deleteBtn').click(function(e) {
  e.preventDefault()
  let emptyArr = []
  localStorage.setItem('stockSymbol', JSON.stringify(emptyArr))
  $('marquee').empty()
});



