

function updateIcon(state) {
    if (state) {
        browser.browserAction.setIcon({ path: "images/preto.png" });
        browser.browserAction.setTitle({ title: "Revert to original colors" });
    } else {
        browser.browserAction.setIcon({ path: "images/branco.png" });
        browser.browserAction.setTitle({ title: "Invert colors" });
    }
}


function handleStorageUpdate(changes, area) {
    if (area == "local") {
        for (var item of Object.keys(changes)) {
            if (item == "InvertColorsState" || item == "ImgColorNoInvert") {
                browser.storage.local.get().then((res) => {
                    var state = res.InvertColorsState ? res.InvertColorsState : false;
                    setIconState(state);

                    browser.tabs.query({}).then((tabs) => {
                        for (var tab of tabs) {
                            setColorsToState(tab.id, state, res.ImgColorNoInvert);
                        };
                    });
                });
            }
        }
    }
}




function inverterCores(b, tab) {

	var query = browser.tabs.query({ currentWindow: true }) ;
	query.then((abas) => {
		for(i=0; i<abas.length; i++){
			browser.tabs.insertCSS(abas[i].id, {
			        file: "dark.css"
			});

			browser.storage.local.get("dontInvertList").then((objeto) => {

				

//				var listaVazia = 0;
//				for(k in lista) listaVazia++;
				if( objeto.enderecos !== undefined ) {
var lista = JSON.parse(objeto);
console.log(lista);
				for( let url of lista.enderecos ) {
					console.log(url);
					if( abas[i].url.match(url) == null ){
						browser.tabs.removeCSS(abas[i].id, {
						        file: "dark.css"
						});
					}
				} //for lista
				}//if lista
			});
		};//for abas
	});

	updateIcon(b);

/*
    browser.storage.local.get().then((res) => {
      if (tab) {
        browser.sessions.getTabValue(tab.id, "invertColors").then( tabState => {
          tabState = !tabState;
          browser.sessions.getTabValue(tab.id, "imgNoInvert").then( imgNoInvert => {
            setColorsToState(tab.id, tabState, res.ImgColorNoInvert);
            setPageIconState(tab, tabState);
          }, nullFunc());
        }, nullFunc());
      } else {
        var state = res.InvertColorsState ? res.InvertColorsState : false;
        state = obj != false ? !state : state;
        setIconState(state);

        browser.storage.local.set({ InvertColorsState: state, ImgColorNoInvert: res.ImgColorNoInvert });

        browser.tabs.query({}).then((tabs) => {
            for (var tab of tabs) {
                setColorsToState(tab.id, state, res.ImgColorNoInvert);
            };
        });
      }
    });
*/
}

function  onUpdatedTabs(){
//atualizar context menu se URL foi bloqueada
//inverter ou não as cores baseado na regex de URLs do local storage
	console.info('Uma aba foi atualizada ou aberta');
}


function persistUrl(pageUrl){
	browser.storage.local.get().then((objeto) => {
		var adicionar = true;
		var oUrl = (new URL(pageUrl));
		var url = oUrl.protocol + "//" + oUrl.hostname;


		if(objeto.enderecos !== undefined ){
				//var lista = JSON.parse(objeto);
var lista = objeto;
		for(i=0; i<lista.enderecos.length; i++){
			if( lista.enderecos[i] == url ){
				lista.enderecos[i] = null;
				adicionar = false;
			}
		}
		} else {
			adicionar = true;
		}
		if(adicionar){
			if(lista.enderecos == null)
				lista.enderecos = [];
			lista.enderecos.push(url);
			console.log(url + " Adicionada");
		}
console.log("FOI ");
		//browser.storage.local.set(JSON.stringify(lista));
		browser.storage.local.set(lista);
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
  title: "Add this URL to the 'dont invert' list",
  //type: "checkbox",
  contexts: ["all"],
  //checked : dontInvertState
}, onCreated);

/*
LISTENER
*/
browser.contextMenus.onClicked.addListener(function(data, tab) {
  switch (data.menuItemId) {
    case "dont-invert":
	persistUrl(data.pageUrl);
      break;

  }
});



browser.tabs.onUpdated.addListener(onUpdatedTabs);
//browser.storage.onChanged.addListener(handleStorageUpdate);
browser.browserAction.onClicked.addListener(inverterCores);

inverterCores(true);	//fazer uma opção: "ativar ao carregar o browser ?"
