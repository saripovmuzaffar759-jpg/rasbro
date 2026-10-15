async function saveCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;

  const { boards = [] } = await chrome.storage.local.get("boards");

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

  await chrome.storage.local.set({ boards });
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "save-current-tab") {
    await saveCurrentTab();
  }
});
