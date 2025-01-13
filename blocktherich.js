let blacklist = [];

console.time("Startup Execution Time");

browser.storage.local.get("status")
    .then((result) => {
        let statusValue = result.status;
        if (statusValue == null || statusValue === true) {
            // Fetch configEntries asynchronously
            browser.storage.local.get("configEntries")
                .then(({ configEntries = [] }) => {
                    console.log("Status: ", statusValue);
                    console.log("Loaded " + configEntries.length + " entries");
                    console.timeEnd("Startup Execution Time");

                    blacklist = configEntries;
                    createObserver();
                    console.time("Hiding Execution Time");
                    findRichNode(document.body);
                    console.timeEnd("Hiding Execution Time");
                })
                .catch((error) => {
                    console.error("Failed to load configEntries:", error);
                });
        }
    })
    .catch((error) => {
        console.error("Failed to load status:", error);
    });


function findRichNode(node) {
    if (node.parentNode && node.parentNode.hasAttribute("btr-rich-node")) {
        return;
    }
    if (node.hasChildNodes()) {
        node.childNodes.forEach(element => {
            findRichNode(element);
        })
    } else if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentNode && node.parentNode.nodeName === 'TEXTAREA') {
            return;
        } else if (isRich(node.textContent)) {
            processNode(node);
        }
    } else if (node.nodeName = "IMG") {
        if (node.src != undefined && node.src != '') {
            if (isRichUrl(node.src)) {
                processNode(node);
                return;
            }
        }
        if (node.alt != undefined && node.alt != '') {
            if (isRich(node.alt)) {
                processNode(node);
                return;
            }
        }
        if (node.title != undefined && node.title != '') {
            if (isRich(node.title)) {
                processNode(node);
            }
        }
    }
}

let cachedRegex = {};

function isRich(element) {
    let hasMatch = false;

    blacklist.forEach(entry => {
        entry.list.forEach(alias => {
            if (!cachedRegex[alias]) {
                cachedRegex[alias] = new RegExp("(^|(\\.|,|\\s|\“)+)" + alias + "((,|\\.|\\s|s|\\’s|\\?|\\'|\“|:|;)+|$)", "ig");
            }
            if (cachedRegex[alias].test(element)) {
                hasMatch = true;
                return;
            }
        });
    });
    return hasMatch;
}

function isRichUrl(url) {
    let hasMatch = false;
    let urlPath = url.split("?")[0].toLowerCase();
    blacklist.forEach(entry => {
        entry.list.forEach(alias => {
            if (urlPath.includes(alias)) {
                hasMatch = true;
                return;
            }
        });
    });
    return hasMatch;
}

function processNode(node) {
    let parentNode = node.parentNode;
    if (parentNode !== document.body) {
        addSelectorToNode(parentNode);
        addBlurToNode(parentNode);
    }
}

function addBlurToNode(node) {
    node.style.filter = "blur(1.5rem)";
    node.style.transition = "1s ease";
    node.addEventListener("mouseenter", function (event) { removeBlurOnHover(this); });
    node.addEventListener("mouseleave", function (event) { applyBlurOnHover(this); });
}

function applyBlurOnHover(node) {
    node.style.filter = "blur(1.5rem)";
}

function removeBlurOnHover(node) {
    node.style.filter = "";
}

function addSelectorToNode(node) {
    if (!node.hasAttribute("btr-rich-node")) {
        node.setAttribute("btr-rich-node", true);
    }
}

function createObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const newNode = mutation.addedNodes[i];
                    findRichNode(newNode);
                }
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}