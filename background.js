

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

function getBlockedUrls(){
	return [
		"^https://sei.anatel.gov.br/sei",
	];
}


function inverterCores(obj, tab) {

/*
- pediu para inverter? s/n
- o site está na lista de "não inverter" ? s/n
*/

	var query = browser.tabs.query({ currentWindow: true }) ;
	query.then((abas) => {
	for(i=0; i<abas.length; i++){
		for( let url of getBlockedUrls() ) {
			console.log(url);
			if( abas[i].url.match(url) == null ){
				browser.tabs.insertCSS(abas[i].id, {
				        file: "dark.css"
				    });
				}
			}
		}
		
	});

	updateIcon(true);
	var bd = browser.storage.local;

	
	browser.storage.local.get().then((res) => {
		console.log(res);
	});
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


function persistUrl(url, b){
//url com regex
//se false, remover do storage e atualizar context menu
//se true, adicionar no storage
}



/*
	CONTEXT MENU
*/

var dontInvertState = false;

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
  title: browser.i18n.getMessage("contextMenuItemDontInvert"),
  type: "checkbox",
  contexts: ["all"],
  checked : dontInvertState
}, onCreated);

/*
LISTENER
*/
browser.contextMenus.onClicked.addListener(function(data, tab) {
  switch (info.menuItemId) {
    case "dont-invert":
      console.log(info.selectionText);
      break;

  }
})

browser.tabs.onUpdated.addListener(onUpdatedTabs);
//browser.storage.onChanged.addListener(handleStorageUpdate);
browser.browserAction.onClicked.addListener(inverterCores);

inverterCores(false);	//carregar plugin mas sem inverter as cores
