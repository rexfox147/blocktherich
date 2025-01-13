const defaultBlackList = [
    { name: "ballmer", list: ["steve ballmer", "steven anthony ballmer"], toggle: false },
    { name: "bezos", list: ["bezos", "jeff bezos"], toggle: false },
    { name: "bloomberg", list: ["michael bloomberg", "michael rubens bloomberg"], toggle: false },
    { name: "brin", list: ["sergey brin", "sergey mikhailovich brin"], toggle: false },
    { name: "buffett", list: ["buffett", "warren buffett", "warren edward buffett"], toggle: false },
    { name: "ellison", list: ["larry ellison", "lawrence joseph ellison"], toggle: false },
    { name: "gates", list: ["bill gates", "william henry gates iii"], toggle: false },
    { name: "kanye", list: ["kanye", "kanye west", "ye west", "kanye omari west"], toggle: false },
    { name: "musk", list: ["musk", "elon musk", "elon reeve musk"], toggle: false },
    { name: "page", list: ["larry page", "lawrence edward page"], toggle: false },
    { name: "trump", list: ["trump", "donald trump", "donald j. trump", "donald john trump"], toggle: false },
    { name: "zuck", list: ["zuck", "zuckerberg", "mark zuckerberg", "mark elliot zuckerberg"], toggle: false }
];


function handleClick() {
    checkExtensionStatus();
}

function checkExtensionStatus() {
    (async () => {
        const isEnabled = await isExtensionEnabled();
        if (isEnabled) {
            saveStatus(false);
            browser.browserAction.setIcon({ path: "icons/blocktherich-off-96.png" });
            browser.tabs.reload();
        } else {
            saveStatus(true);
            browser.browserAction.setIcon({ path: "icons/blocktherich-on-96.png" });
            browser.tabs.reload();
        }
    })();
}

async function isExtensionEnabled() {
    let result = await browser.storage.local.get("status");
    return result.status;
}

function saveStatus(value) {
    browser.storage.local.set({ "status": value });
}

async function ensureDefault(){
    let {configEntries = []} = await browser.storage.local.get("configEntries");

    if(!configEntries || configEntries.length === 0 ) {
        configEntries = defaultBlackList
        await browser.storage.local.set({ configEntries: configEntries });
    }
}

browser.runtime.onInstalled.addListener(() => { saveStatus(true); });

browser.runtime.onStartup.addListener(() => { saveStatus(true); });

browser.browserAction.onClicked.addListener(handleClick);

browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        ensureDefault();
    }
});