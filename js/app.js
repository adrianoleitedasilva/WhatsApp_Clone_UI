// ===================== ESTADO =====================
const state = {
  contacts: CONTACTS,
  filter: "all",
  search: "",
  selectedId: null,
};

// ===================== ELEMENTOS =====================
const el = {
  app: document.getElementById("app"),
  chatList: document.getElementById("chatList"),
  searchInput: document.getElementById("searchInput"),
  filterChips: document.querySelectorAll(".filter-chip"),
  emptyState: document.getElementById("emptyState"),
  conversation: document.getElementById("conversation"),
  convAvatar: document.getElementById("convAvatar"),
  convName: document.getElementById("convName"),
  convStatus: document.getElementById("convStatus"),
  messages: document.getElementById("messages"),
  messageInput: document.getElementById("messageInput"),
  sendBtn: document.getElementById("sendBtn"),
  backBtn: document.getElementById("backBtn"),
  themeBtn: document.getElementById("themeBtn"),
  myAvatar: document.getElementById("myAvatar"),
  typingIndicator: document.getElementById("typingIndicator"),
  emojiBtn: document.getElementById("emojiBtn"),
  emojiPicker: document.getElementById("emojiPicker"),
};

// ===================== TEMA =====================
function initTheme() {
  const saved = localStorage.getItem("wc-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("wc-theme", next);
}

// ===================== UTIL =====================
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getContact(id) {
  return state.contacts.find((c) => c.id === id);
}

function lastMessage(contact) {
  return contact.messages[contact.messages.length - 1];
}

function tickSvg(status) {
  if (status === "sent") {
    return '<svg class="tick" viewBox="0 0 16 15"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.32.32 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.235.204.55.204.75-.032l6.271-8.223a.366.366 0 0 0-.063-.51z"/></svg>';
  }
  const readClass = status === "read" ? " read" : "";
  return `<svg class="tick${readClass}" viewBox="0 0 18 15"><path d="M11.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.32.32 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.235.204.55.204.75-.032l6.271-8.223a.366.366 0 0 0-.063-.51z"/><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.36-1.235a.32.32 0 0 0-.484.032l-.372.488a.418.418 0 0 0 .035.54l2.32 2.107c.235.204.55.204.75-.032l6.271-8.223a.366.366 0 0 0-.063-.51z"/></svg>`;
}

// ===================== RENDER: LISTA DE CONVERSAS =====================
function passesFilter(contact) {
  if (state.filter === "unread" && !(contact.unread > 0)) return false;
  if (state.filter === "favorites" && !contact.favorite) return false;
  if (state.filter === "groups" && !contact.group) return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    if (!contact.name.toLowerCase().includes(q)) return false;
  }
  return true;
}

function renderChatList() {
  const list = [...state.contacts]
    .filter(passesFilter)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  el.chatList.innerHTML = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.style.padding = "24px";
    li.style.textAlign = "center";
    li.style.color = "var(--color-text-secondary)";
    li.style.fontSize = "14px";
    li.textContent = "Nenhuma conversa encontrada";
    el.chatList.appendChild(li);
    return;
  }

  for (const contact of list) {
    const last = lastMessage(contact);
    const li = document.createElement("li");
    li.className = "chat-item";
    if (contact.id === state.selectedId) li.classList.add("selected");
    if (contact.unread > 0) li.classList.add("has-unread");
    if (contact.pinned) li.classList.add("pinned");
    li.dataset.id = contact.id;

    const preview = last.from === "me"
      ? `${tickSvg(last.status)} ${escapeHtml(last.text)}`
      : `${contact.group ? "" : ""}${escapeHtml(last.text)}`;

    li.innerHTML = `
      <div class="avatar${contact.online ? " online" : ""}" data-color="${contact.color}" data-initials="${contact.initials}"></div>
      <div class="chat-item-body">
        <div class="chat-item-top">
          <span class="chat-item-name">${escapeHtml(contact.name)}</span>
          <span class="chat-item-time">${last.time}</span>
        </div>
        <div class="chat-item-bottom">
          <span class="chat-item-preview">${preview}</span>
          ${contact.unread > 0 ? `<span class="unread-badge">${contact.unread}</span>` : ""}
        </div>
      </div>
    `;

    li.addEventListener("click", () => selectContact(contact.id));
    el.chatList.appendChild(li);
  }
}

// ===================== RENDER: CONVERSA =====================
function selectContact(id) {
  state.selectedId = id;
  const contact = getContact(id);
  contact.unread = 0;

  el.app.classList.add("show-chat");
  el.emptyState.hidden = true;
  el.conversation.hidden = false;
  el.emojiPicker.hidden = true;

  el.convAvatar.setAttribute("data-color", contact.color);
  el.convAvatar.setAttribute("data-initials", contact.initials);
  el.convAvatar.classList.toggle("online", !!contact.online);
  el.convName.textContent = contact.name;
  el.convStatus.textContent = contact.group ? "clique para ver participantes" : contact.online ? "online" : "visto por último hoje";

  renderChatList();
  renderMessages(contact);
  el.messageInput.focus();
}

function goBack() {
  el.app.classList.remove("show-chat");
}

function renderMessages(contact) {
  el.messages.innerHTML = "";
  let lastDateLabel = null;

  for (const msg of contact.messages) {
    const dateLabel = msg.time.match(/^\d{2}:\d{2}$/) ? "Hoje" : msg.time;
    if (dateLabel !== lastDateLabel && !msg.time.match(/^\d{2}:\d{2}$/)) {
      appendDateChip(dateLabel);
      lastDateLabel = dateLabel;
    } else if (lastDateLabel === null) {
      appendDateChip("Hoje");
      lastDateLabel = "Hoje";
    }
    appendMessageBubble(msg);
  }
  scrollMessagesToBottom();
}

function appendDateChip(label) {
  const wrap = document.createElement("div");
  wrap.className = "date-chip-wrap";
  wrap.innerHTML = `<span class="date-chip">${escapeHtml(label)}</span>`;
  el.messages.appendChild(wrap);
}

function appendMessageBubble(msg) {
  const row = document.createElement("div");
  row.className = `msg-row ${msg.from === "me" ? "out" : "in"}`;

  const metaTicks = msg.from === "me" ? tickSvg(msg.status) : "";

  row.innerHTML = `
    <div class="bubble">
      <span class="msg-text">${escapeHtml(msg.text)}</span>
      <span class="msg-meta">${msg.time} ${metaTicks}</span>
    </div>
  `;
  el.messages.appendChild(row);
}

function scrollMessagesToBottom() {
  el.messages.scrollTop = el.messages.scrollHeight;
}

// ===================== ENVIO DE MENSAGENS =====================
function currentTime() {
  const d = new Date();
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}

function sendMessage() {
  const text = el.messageInput.value.trim();
  if (!text || !state.selectedId) return;

  const contact = getContact(state.selectedId);
  const msg = { from: "me", text, time: currentTime(), status: "sent" };
  contact.messages.push(msg);

  el.messageInput.value = "";
  el.emojiPicker.hidden = true;
  autoGrowTextarea();
  renderMessages(contact);
  renderChatList();

  setTimeout(() => updateMessageStatus(contact, msg, "delivered"), 500);
  setTimeout(() => updateMessageStatus(contact, msg, "read"), 1200);
  simulateReply(contact);
}

function updateMessageStatus(contact, msg, status) {
  msg.status = status;
  if (state.selectedId === contact.id) {
    renderMessages(contact);
  }
  renderChatList();
}

function simulateReply(contact) {
  if (contact.group) return; // grupos não respondem automaticamente
  const shouldReply = Math.random() < 0.85;
  if (!shouldReply) return;

  const delay = 1500 + Math.random() * 2000;

  if (state.selectedId === contact.id) {
    el.typingIndicator.hidden = false;
    scrollMessagesToBottom();
  }

  setTimeout(() => {
    el.typingIndicator.hidden = true;
    const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const msg = { from: "them", text: reply, time: currentTime(), status: "read" };
    contact.messages.push(msg);

    if (state.selectedId === contact.id) {
      renderMessages(contact);
    } else {
      contact.unread = (contact.unread || 0) + 1;
    }
    renderChatList();
  }, delay);
}

function autoGrowTextarea() {
  el.messageInput.style.height = "auto";
  el.messageInput.style.height = Math.min(el.messageInput.scrollHeight, 80) + "px";
}

// ===================== EMOJI PICKER =====================
function buildEmojiPicker() {
  el.emojiPicker.innerHTML = "";
  for (const emoji of EMOJIS) {
    const btn = document.createElement("button");
    btn.textContent = emoji;
    btn.addEventListener("click", () => {
      el.messageInput.value += emoji;
      el.messageInput.focus();
      autoGrowTextarea();
    });
    el.emojiPicker.appendChild(btn);
  }
}

function toggleEmojiPicker() {
  el.emojiPicker.hidden = !el.emojiPicker.hidden;
}

// ===================== EVENTOS =====================
function bindEvents() {
  el.searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderChatList();
  });

  el.filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      el.filterChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.filter = chip.dataset.filter;
      renderChatList();
    });
  });

  el.sendBtn.addEventListener("click", sendMessage);

  el.messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  el.messageInput.addEventListener("input", autoGrowTextarea);

  el.backBtn.addEventListener("click", goBack);
  el.themeBtn.addEventListener("click", toggleTheme);

  el.emojiBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleEmojiPicker();
  });

  document.addEventListener("click", (e) => {
    if (!el.emojiPicker.hidden && !el.emojiPicker.contains(e.target) && e.target !== el.emojiBtn) {
      el.emojiPicker.hidden = true;
    }
  });
}

// ===================== INIT =====================
function init() {
  initTheme();
  el.myAvatar.setAttribute("data-color", "2");
  buildEmojiPicker();
  bindEvents();
  renderChatList();
}

init();
