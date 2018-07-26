function nullFunc() {
}

function setColors(tabId) {
    browser.storage.local.get().then((res) => {
        setColorsToState(tabId, res.InvertColorsState, res.ImgColorNoInvert);
    });
}

function setColorsToState(tabId, state, imgNoInvert) {
    if (state == true) {
        invertColors(tabId);
        if (imgNoInvert) invertImg(tabId);
    } else {
        revertImg(tabId);
        revertColors(tabId);
    }
    browser.sessions.setTabValue(tabId, "invertColors", state).then(nullFunc(), nullFunc());
    browser.sessions.setTabValue(tabId, "imgNoInvert", imgNoInvert).then(nullFunc(), nullFunc());
}

function toggleColors(obj, tab) {
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
}

function setIconState(state) {
    if (state) {
        browser.browserAction.setIcon({ path: "icons/preto.png" });
        browser.browserAction.setTitle({ title: "Revert Colors" });
    } else {
        browser.browserAction.setIcon({ path: "images/branco.png" });
        browser.browserAction.setTitle({ title: "Invert Colors" });
    }
}

function setPageIconState(tab, state) {
    if (state) {
        browser.pageAction.setIcon({tabId: tab.id, path: "images/preto.png" });
        browser.pageAction.setTitle({tabId: tab.id, title: "Revert Current Page Colors" });
    } else {
        browser.pageAction.setIcon({tabId: tab.id, path: "images/branco.png" });
        browser.pageAction.setTitle({tabId: tab.id, title: "Invert Current Page Colors" });
    }
}

function invertImg(tabId) {
    browser.tabs.insertCSS(tabId, {
        file: "image.css"
    });
}

function revertImg(tabId) {
    browser.tabs.removeCSS(tabId, {
        file: "image.css"
    });
}

function invertColors(tabId) {
    browser.tabs.insertCSS(tabId, {
        file: "style.css"
    });
}

function revertColors(tabId) {
    browser.tabs.removeCSS(tabId, {
        file: "style.css"
    });
}

function handleUpdated(tabId, changeInfo, tabInfo) {
    browser.pageAction.show(tabId);
    if (changeInfo.status) {
        setColors(tabId);
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

browser.contextMenus.create({
    id: "GoDark",
    title: "GoDark"
});



function inverterCores(obj, tab) {

/*
- pediu para inverter? s/n
- o site está na lista de "não inverter" ? s/n
*/

	var query = browser.tabs.query({currentWindow: true}) ;
	query.then((abas) => {
	for(i=0; i<abas.length; i++){
		browser.tabs.insertCSS(abas[i].id, {
		        file: "dark.css"
		    });
		}
	});

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
	console.info('Uma aba foi atualizada ou aberta');
}


function  onClickedContextMenu(data, tab){
	console.info('onClickedContextMenu');
  switch (data.menuItemId) {
    case "log-selection":
      console.log(data.selectionText);
      break;

  }
}

/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated() {
  if (browser.runtime.lastError) {
    console.error(`Error: ${browser.runtime.lastError}`);
  } 
}



/*
	CONTEXT MENU
*/

var dontInvertState = false;


browser.contextMenus.create({
  id: "dont-invert",
  title: browser.i18n.getMessage("contextMenuItemDontInvert"),
  type: "checkbox",
  contexts: ["all"],
  checked : dontInvertState
}, onCreated);
/*
browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "log-selection":
      console.log(info.selectionText);
      break;

  }
})
*/


browser.contextMenus.onClicked.addListener(onClickedContextMenu(data, tab) );
browser.tabs.onUpdated.addListener(onUpdatedTabs);
//browser.storage.onChanged.addListener(handleStorageUpdate);
browser.browserAction.onClicked.addListener(inverterCores);
/*
browser.pageAction.onClicked.addListener((tab) => {
    toggleColors(true,tab);
});
browser.contextMenus.onClicked.addListener(toggleColors);
*/
inverterCores(false);	//carregar plugin mas sem inverter as cores
//toggleColors(false);
