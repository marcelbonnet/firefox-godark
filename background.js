

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
        browser.storage.local.set(o);
    });
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



			browser.storage.local.get("enderecos").then((lista) => {

	var query = browser.tabs.query({ currentWindow: true }) ;
	query.then((abas) => {
		for(i=0; i<abas.length; i++){
			browser.tabs.insertCSS(abas[i].id, {
			        file: "dark.css"
			});
		};
				if( lista !== undefined && lista.enderecos !== undefined ) {

				for( k=0; k<lista.enderecos.length; k++ ) {
					var url = lista.enderecos[k];
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

	updateIcon(b);
}


function persistUrl(pageUrl){
	browser.storage.local.get().then((lista) => {
		var adicionar = true;
		var oUrl = (new URL(pageUrl));
		var url = oUrl.protocol + "//" + oUrl.hostname;


		if(lista.enderecos !== undefined ){
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
  title: " Add/Remove this URL to the 'dont invert' list",
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
        startup();
    break;

  }
});


browser.tabs.onUpdated.addListener(inverterCores);
browser.browserAction.onClicked.addListener(inverterCores);

//on startup
function startup(){
    browser.storage.local.get("start").then((o) => {
        inverterCores(o.state);
    });
}


startup();
