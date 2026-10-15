const boardsEl = document.getElementById("boards");
const saveBtn = document.getElementById("save-current");

async function getBoards() {
  const { boards } = await chrome.storage.local.get("boards");
  return boards || [{ id: "inbox", title: "Входящие", items: [] }];
}

async function setBoards(boards) {
  await chrome.storage.local.set({ boards });
}

function render(boards) {
  boardsEl.innerHTML = "";

  for (const board of boards) {
    const section = document.createElement("section");
    section.className = "board";

    const title = document.createElement("h2");
    title.textContent = board.title;
    section.appendChild(title);

    const list = document.createElement("div");
    list.className = "items";

    for (const item of board.items) {
      const a = document.createElement("a");
      a.className = "item";
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.title;
      list.appendChild(a);
    }

    section.appendChild(list);
    boardsEl.appendChild(section);
  }
}

async function saveCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;

  const boards = await getBoards();
  let board = boards.find((b) => b.id === "inbox");
  if (!board) {
    board = { id: "inbox", title: "Входящие", items: [] };
    boards.push(board);
  }

  board.items.unshift({
    id: crypto.randomUUID(),
    title: tab.title || tab.url,
    url: tab.url,
    createdAt: Date.now()
  });

  await setBoards(boards);
  render(boards);
}

saveBtn.addEventListener("click", saveCurrentTab);

(async function init() {
  const boards = await getBoards();
  render(boards);
})();
