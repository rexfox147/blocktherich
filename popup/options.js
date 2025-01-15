const entriesContainer = document.getElementById("entries");
const addEntryButton = document.getElementById("add-entry");
const saveButton = document.getElementById("save");
const statusIcon = document.getElementById("status");
const refreshIcon = document.getElementById("refresh");

// Load entries from storage
async function loadEntries() {
    let {configEntries = []} = await browser.storage.local.get("configEntries");

    entriesContainer.innerHTML = "";
    configEntries.forEach((entry, index) => addEntry(entry, index));
}

// Add an entry to the DOM
function addEntry(entry = { name: "", list: [""], toggle: false }, index = null) {
    const entryDiv = document.createElement("div");
    entryDiv.className = "entry";
    entryDiv.dataset.index = index;

    const nameDiv = document.createElement("div");

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Name: ";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Name";
    nameInput.value = entry.name;
    nameLabel.appendChild(nameInput);
    nameDiv.appendChild(nameLabel);

    const tagDiv = document.createElement("div");
    tagDiv.className = "tagDiv";

    const tagMasterLabel = document.createElement("label");
    tagMasterLabel.textContent = "Tags: ";
    tagMasterLabel.style.display = "inline-block"; // Keep the label inline
    tagMasterLabel.style.verticalAlign = "top"; // Align it properly
    const tagContainer = document.createElement("div");
    tagContainer.className = "tag-container";
    tagMasterLabel.appendChild(tagContainer);
    tagMasterLabel.className = "tagDiv"
    tagDiv.appendChild(tagMasterLabel);

    entry.list.forEach((tag) => addTag(tagContainer, tag));
    addTag(tagContainer, "");

    const toggleDiv = document.createElement("div");
    const toggleLabel = document.createElement("label");
    toggleLabel.textContent = "Toggle: ";
    const toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.checked = entry.toggle;
    toggleLabel.appendChild(toggleInput);
    toggleDiv.appendChild(toggleLabel)

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Entry";
    deleteButton.className = "button";
    deleteButton.onclick = () => entryDiv.remove();

    entryDiv.appendChild(nameDiv);
    entryDiv.appendChild(tagDiv);
    entryDiv.appendChild(toggleDiv);
    entryDiv.appendChild(deleteButton);

    entriesContainer.appendChild(entryDiv);
}

// Function to add a tag to the tag container
function addTag(container, value) {
    if(container.children.length > 0 && container.children[container.children.length - 1].children[0].value.trim() === "") {
        return
    }

    const tagDiv = document.createElement("div");
    //tagDiv.className = "tag";

    const tagText = document.createElement("input");
    tagText.value = value;
    tagText.className = "tag-text"
    tagText.addEventListener('input', resizeInput); // bind the "resizeInput" callback on "input" event
    resizeInput.call(tagText); // immediately call the function
    tagText.addEventListener('blur', () => {addTag(container, "")})

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.className = "delete-tag";
    deleteButton.onclick = () => {tagDiv.remove();if(container.children.length === 0){addTag(container,"")}}

    tagDiv.appendChild(tagText);
    tagDiv.appendChild(deleteButton);
    container.appendChild(tagDiv);
}

function resizeInput() {
    this.style.width = Math.max(this.value.length, 3) + "ch";
}

// Save entries to storage
async function saveEntries() {
    const entries = [];
    entriesContainer.querySelectorAll(".entry").forEach((entryDiv) => {
        const name = entryDiv.querySelector("input[type='text']").value.trim();

        const tags = Array.from(entryDiv.querySelectorAll(".tag-text"))
            .map((input) => input.value.trim())
            .filter((tag) => tag !== ""); // Ensure empty tags are excluded

        const toggle = entryDiv.querySelector("input[type='checkbox']").checked;
        entries.push({ name, list: tags, toggle });
    });
    await browser.storage.local.set({ configEntries: entries });
    alert("Configuration saved!");
}

function checkExtensionStatus() {
    (async () => {
        const isEnabled = await isExtensionEnabled();
        if (isEnabled) {
            saveStatus(false);
            browser.browserAction.setIcon({ path: browser.runtime.getURL("icons/blocktherich-off-96.png")});
            statusIcon.src = browser.runtime.getURL("icons/blocktherich-off-48.png");
            statusIcon.title = "Disabled"
            //browser.tabs.reload();
        } else {
            saveStatus(true);
            browser.browserAction.setIcon({ path: browser.runtime.getURL("icons/blocktherich-on-96.png")});
            statusIcon.src = browser.runtime.getURL("icons/blocktherich-on-48.png");
            statusIcon.title = "Enabled"
            //browser.tabs.reload();
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

async function refresh(){
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

    if (tabs.length > 0) {
        const currentTab = tabs[0];
        console.log("Reloading tab:", currentTab.id);

        // Reload the current tab
        await browser.tabs.reload(currentTab.id);
    } else {
        console.log("No active tab found to reload.");
    }
}

addEntryButton.addEventListener("click", () => addEntry());
saveButton.addEventListener("click", saveEntries);
statusIcon.addEventListener("click", checkExtensionStatus);
refreshIcon.addEventListener("click", refresh);

// Load the entries on page load
loadEntries();
