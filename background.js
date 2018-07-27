

function updateIcon(state) {
    if (state) {
        browser.browserAction.setIcon({ path: "images/preto.png" });
        browser.browserAction.setTitle({ title: "Revert to original colors" });
    } else {
        browser.browserAction.setIcon({ path: "images/branco.png" });
        browser.browserAction.setTitle({ title: "Invert colors" });
    }

    browser.storage.local.get("start").then((o) => {
        o.state = state;
        console.log("vou salvar : "); console.log(o);
        browser.storage.local.set(o);
    });
}

//retorna objeto de configuração do plugin
function getConfig(){
    return browser.storage.local.get().then(function(o){
        //inicialização
        if(o.config === undefined) o.config = {};
        if(o.config.estado === undefined) o.config.estado = false;
        if(o.config.enderecos === undefined) o.config.enderecos = [];

        console.log('Meu estado atual é: ' + o.config.estado );
        console.log('Domínios que não devem ter a cor invertida: ' + o.config.enderecos );
        return o;
    });
}



function inverterCores() {

	getConfig().then((obj) => {

	var query = browser.tabs.query({ currentWindow: true }) ;
	query.then((abas) => {
		for(i=0; i<abas.length; i++){
			if(obj.config.estado){
                browser.tabs.insertCSS(abas[i].id, {
                        file: "dark.css"
                });
            } else {
                browser.tabs.removeCSS(abas[i].id, {
                        file: "dark.css"
                });
            }
		};

				if( obj.config.estado  ) {

				for( k=0; k<obj.config.enderecos.length; k++ ) {
					var url = obj.config.enderecos[k];
for(i=0; i<abas.length; i++){

//console.log( abas[i].url.match(url) !== null );

					if( abas[i].url.match(url) !== null ){
console.log( 'removendo '  + abas[i].url );
						browser.tabs.removeCSS(abas[i].id, {
						        file: "dark.css"
						});
					}
}
				} //for lista
				}//if lista
 	});//fecha a query

			});


}


function persistUrl(pageUrl){
	return getConfig().then((obj) => {
		var adicionar = true;
		var oUrl = (new URL(pageUrl));
		var url = oUrl.protocol + "//" + oUrl.hostname;


		if(obj.config.enderecos.length > 0 ){
		for(i=0; i<obj.config.enderecos.length; i++){
			if( obj.config.enderecos[i] == url ){
				obj.config.enderecos[i] = null;
				adicionar = false;
			}
		}
		} else {
			adicionar = true;
		}
		if(adicionar){
			//if(lista.enderecos == null)
			//	lista.enderecos = [];
			obj.config.enderecos.push(url);
			console.log(url + " Adicionada");
		}

		browser.storage.local.set(obj);
        return adicionar;
	});
}



/*
	CONTEXT MENU
*/

//var dontInvertState = false;

function onCreated() {
  if (browser.runtime.lastError) {
    console.error(`Error: ${browser.runtime.lastError}`);
  }
}

/*
MENU ITENS
*/

browser.contextMenus.create({
  id: "dont-invert",
  title: "Ignorar o domínio/página desta aba ou remover da lista se já adicionado",
  //type: "checkbox",
  contexts: ["all"],
  //checked : dontInvertState
}, onCreated);

/*
//itens de menu apenas para teste do plugin
browser.contextMenus.create({
  id: "ligar",
  title: " Ligar",
  contexts: ["all"],
}, onCreated);

browser.contextMenus.create({
  id: "desligar",
  title: " Desligar",
  contexts: ["all"],
}, onCreated);
*/

/*
LISTENER
*/
browser.contextMenus.onClicked.addListener(function(data, tab) {
  switch (data.menuItemId) {
    case "dont-invert":
        persistUrl(data.pageUrl).then(function(b){ console.log('add ou rm? ' + b); inverterCores(); });
        break;
    case "ligar":
        inverterCores(true);
        break;
    case "desligar":
        inverterCores(false);
        break;

  }
});

function browserAction(){
    getConfig().then(function(o){
        o.config.estado = !o.config.estado;

        if (o.config.estado) {
            browser.browserAction.setIcon({ path: "images/preto.png" });
            browser.browserAction.setTitle({ title: "Reverter para cores originais" });
        } else {
            browser.browserAction.setIcon({ path: "images/branco.png" });
            browser.browserAction.setTitle({ title: "Inverter Cores" });
        }

        browser.storage.local.set(o); inverterCores();

        console.log(o);
    });
}

function onUpdated(){
    browser.storage.local.get("start").then((o) => {
        if(o.state === undefined)
            o.state = false;
        console.log("onUpdate chamado. Estado é " + o.state);
        inverterCores(o.state);
    });
}

browser.tabs.onUpdated.addListener(inverterCores);
browser.browserAction.onClicked.addListener(browserAction);
