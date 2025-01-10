const entriesContainer = document.getElementById("entries");
const addEntryButton = document.getElementById("add-entry");
const saveButton = document.getElementById("save");

// Load entries from storage
async function loadEntries() {
    const { configEntries = [] } = await browser.storage.local.get("configEntries");
    entriesContainer.innerHTML = "";
    configEntries.forEach((entry, index) => addEntry(entry, index));
}

// Add an entry to the DOM
function addEntry(entry = { name: "", list: [""], toggle: false }, index = null) {
    const entryDiv = document.createElement("div");
    entryDiv.className = "entry";
    entryDiv.dataset.index = index;

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Name";
    nameInput.value = entry.name;

    const listInput = document.createElement("input");
    listInput.type = "text";
    listInput.placeholder = "Comma-separated list";
    listInput.value = entry.list.join(", ");

    const toggleInput = document.createElement("input");
    toggleInput.type = "checkbox";
    toggleInput.checked = entry.toggle;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => entryDiv.remove();

    entryDiv.appendChild(nameInput);
    entryDiv.appendChild(listInput);
    entryDiv.appendChild(toggleInput);
    entryDiv.appendChild(deleteButton);

    entriesContainer.appendChild(entryDiv);
}

// Save entries to storage
async function saveEntries() {
    const entries = [];
    entriesContainer.querySelectorAll(".entry").forEach((entryDiv) => {
        const name = entryDiv.querySelector("input[type='text']").value.trim();
        const list = entryDiv.querySelectorAll("input[type='text']")[1].value.split(",").map(s => s.trim());
        const toggle = entryDiv.querySelector("input[type='checkbox']").checked;
        entries.push({ name, list, toggle });
    });
    await browser.storage.local.set({ configEntries: entries });
    alert("Configuration saved!");
}

addEntryButton.addEventListener("click", () => addEntry());
saveButton.addEventListener("click", saveEntries);

// Load the entries on page load
loadEntries();
