const OBJECTS = [
  {
    name: "Barrel",
    attributes: ["wooden", "container", "cylindrical", "storage", "sturdy", "old-fashioned", "large"]
  },
  {
    name: "Lantern",
    attributes: ["metal", "portable", "light source", "old-fashioned", "handheld", "sturdy"]
  },
  {
    name: "Backpack",
    attributes: ["fabric", "container", "portable", "wearable", "modern", "storage"]
  },
  {
    name: "Thermos",
    attributes: ["metal", "container", "portable", "cylindrical", "modern", "insulated"]
  },
  {
    name: "Toolbox",
    attributes: ["metal", "container", "portable", "sturdy", "storage", "modern"]
  },
  {
    name: "Treasure Chest",
    attributes: ["wooden", "container", "storage", "lockable", "old-fashioned", "sturdy"]
  },
  {
    name: "Mug",
    attributes: ["ceramic", "container", "portable", "round", "fragile"]
  },
  {
    name: "Drum",
    attributes: ["cylindrical", "musical", "portable", "sturdy", "hollow"]
  },
  {
    name: "Suitcase",
    attributes: ["container", "portable", "storage", "modern", "lockable", "sturdy"]
  },
  {
    name: "Vase",
    attributes: ["ceramic", "container", "decorative", "fragile", "tall"]
  }
];

const ATTRIBUTE_DECK_TEMPLATE = [
  "wooden", "wooden",
  "metal", "metal", "metal",
  "fabric",
  "ceramic", "ceramic",
  "container", "container", "container",
  "portable", "portable", "portable",
  "cylindrical", "cylindrical",
  "storage", "storage", "storage",
  "sturdy", "sturdy", "sturdy",
  "old-fashioned", "old-fashioned",
  "modern", "modern", "modern",
  "lockable", "lockable",
  "light source",
  "wearable",
  "insulated",
  "decorative",
  "musical",
  "hollow",
  "fragile", "fragile",
  "handheld",
  "round",
  "tall",
  "large"
];

const state = {
  selectedObject: OBJECTS[0].name,
  deck: [],
  discard: [],
  hand: [],
  tower: [],
  selectedHandIndex: null
};

const elements = {
  objectSelect: document.getElementById("objectSelect"),
  connectorSelect: document.getElementById("connectorSelect"),
  notCheckbox: document.getElementById("notCheckbox"),
  drawDeckButton: document.getElementById("drawDeckButton"),
  drawDiscardButton: document.getElementById("drawDiscardButton"),
  discardButton: document.getElementById("discardButton"),
  removeTopButton: document.getElementById("removeTopButton"),
  resetButton: document.getElementById("resetButton"),
  buildButton: document.getElementById("buildButton"),
  handCards: document.getElementById("handCards"),
  towerLevels: document.getElementById("towerLevels"),
  expressionOutput: document.getElementById("expressionOutput"),
  ruleFeedback: document.getElementById("ruleFeedback"),
  candidateFeedback: document.getElementById("candidateFeedback"),
  deckCount: document.getElementById("deckCount"),
  discardCount: document.getElementById("discardCount"),
  handCount: document.getElementById("handCount"),
  towerCount: document.getElementById("towerCount"),
  orUsage: document.getElementById("orUsage"),
  notUsage: document.getElementById("notUsage"),
  positiveUsage: document.getElementById("positiveUsage"),
  discardPreview: document.getElementById("discardPreview")
};

setupRevealAnimations();

if (elements.objectSelect) {
  initializePrototype();
}

function initializePrototype() {
  populateObjectSelect();
  bindEvents();
  resetRound();
}

function populateObjectSelect() {
  elements.objectSelect.innerHTML = "";
  OBJECTS.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    elements.objectSelect.appendChild(option);
  });
  elements.objectSelect.value = state.selectedObject;
}

function bindEvents() {
  elements.objectSelect.addEventListener("change", (event) => {
    state.selectedObject = event.target.value;
    render();
  });

  elements.drawDeckButton.addEventListener("click", drawFromDeck);
  elements.drawDiscardButton.addEventListener("click", drawFromDiscard);
  elements.discardButton.addEventListener("click", discardSelectedCard);
  elements.removeTopButton.addEventListener("click", removeTopLevel);
  elements.resetButton.addEventListener("click", resetRound);
  elements.buildButton.addEventListener("click", addSelectedCardToTower);
}

function setupRevealAnimations() {
  const sections = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  sections.forEach((section) => observer.observe(section));
}

function resetRound() {
  state.deck = shuffle([...ATTRIBUTE_DECK_TEMPLATE]);
  state.discard = [];
  state.hand = [];
  state.tower = [];
  state.selectedHandIndex = null;
  elements.connectorSelect.value = "AND";
  elements.notCheckbox.checked = false;

  for (let index = 0; index < 4; index += 1) {
    drawCardIntoHand();
  }

  render();
}

function shuffle(items) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function drawCardIntoHand(card) {
  if (state.hand.length >= 7) {
    return false;
  }

  const nextCard = card ?? state.deck.pop();

  if (!nextCard) {
    return false;
  }

  state.hand.push(nextCard);
  return true;
}

function drawFromDeck() {
  const success = drawCardIntoHand();

  if (!success) {
    render("You cannot draw right now. Either your hand is full or the deck is empty.");
    return;
  }

  render("You drew one attribute card from the deck.");
}

function drawFromDiscard() {
  if (state.hand.length >= 7) {
    render("Your hand is full. Discard a card before taking from the discard pile.");
    return;
  }

  const topDiscard = state.discard.pop();

  if (!topDiscard) {
    render("There is no card in the discard pile to take.");
    return;
  }

  state.hand.push(topDiscard);
  render("You took the top card from the discard pile.");
}

function discardSelectedCard() {
  if (state.selectedHandIndex === null) {
    render("Select a card from your hand before discarding.");
    return;
  }

  const [card] = state.hand.splice(state.selectedHandIndex, 1);
  state.discard.push(card);
  state.selectedHandIndex = null;
  render("The selected attribute was discarded.");
}

function removeTopLevel() {
  if (state.tower.length === 0) {
    render("There is no tower level to remove yet.");
    return;
  }

  const removed = state.tower.pop();
  const returnToHand = state.hand.length < 7;

  if (returnToHand) {
    state.hand.push(removed.attribute);
    render("The top level was removed and the card returned to your hand.");
  } else {
    state.discard.push(removed.attribute);
    render("The top level was removed and the card went to the discard pile because your hand is full.");
  }
}

function addSelectedCardToTower() {
  if (state.selectedHandIndex === null) {
    render("Select a card from your hand before building.");
    return;
  }

  if (state.tower.length >= 5) {
    render("Your tower already has five levels. Reveal it or remove the top level first.");
    return;
  }

  const connector = state.tower.length === 0 ? null : elements.connectorSelect.value;
  const negated = elements.notCheckbox.checked;
  const notCount = state.tower.filter((level) => level.negated).length;
  const orCount = state.tower.filter((level) => level.connector === "OR").length;

  if (connector === "OR" && state.tower.length === 0) {
    render("OR cannot be used on the first level of a tower.");
    return;
  }

  if (connector === "OR" && orCount >= 1) {
    render("You can use OR only once in a tower.");
    return;
  }

  if (connector === "OR" && state.tower[state.tower.length - 1]?.connector === "OR") {
    render("OR can only be used with the most recent attribute, so chained OR statements are not allowed.");
    return;
  }

  if (negated && notCount >= 2) {
    render("You can use NOT only twice in a tower.");
    return;
  }

  const [attribute] = state.hand.splice(state.selectedHandIndex, 1);
  state.selectedHandIndex = null;
  state.tower.push({
    attribute,
    connector,
    negated
  });

  render("One level was added to the tower.");
}

function render(message) {
  renderCounts();
  renderHand();
  renderTower();
  renderFeedback(message);
  updateButtons();
}

function renderCounts() {
  const notCount = state.tower.filter((level) => level.negated).length;
  const orCount = state.tower.filter((level) => level.connector === "OR").length;
  const positiveCount = state.tower.filter((level) => !level.negated).length;

  elements.deckCount.textContent = String(state.deck.length);
  elements.discardCount.textContent = String(state.discard.length);
  elements.handCount.textContent = String(state.hand.length);
  elements.towerCount.textContent = `${state.tower.length} / 5`;
  elements.orUsage.textContent = `${orCount} / 1`;
  elements.notUsage.textContent = `${notCount} / 2`;
  elements.positiveUsage.textContent = `${positiveCount} / 3 min`;
  elements.discardPreview.textContent = state.discard[state.discard.length - 1] ?? "Empty";
}

function renderHand() {
  elements.handCards.innerHTML = "";

  if (state.hand.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Your hand is empty. Draw a card to keep building.";
    elements.handCards.appendChild(empty);
    return;
  }

  state.hand.forEach((card, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "attribute-card";
    button.setAttribute("aria-pressed", state.selectedHandIndex === index ? "true" : "false");

    if (state.selectedHandIndex === index) {
      button.classList.add("selected");
    }

    button.innerHTML = `
      <span class="card-label">${card}</span>
      <span class="card-meta">Attribute card</span>
    `;

    button.addEventListener("click", () => {
      state.selectedHandIndex = state.selectedHandIndex === index ? null : index;
      render();
    });

    elements.handCards.appendChild(button);
  });
}

function renderTower() {
  elements.towerLevels.innerHTML = "";

  if (state.tower.length === 0) {
    const empty = document.createElement("li");
    empty.className = "tower-item";
    empty.innerHTML = `
      <span class="tower-index">0</span>
      <div>
        <strong>No levels yet</strong>
        <div class="tower-rule">Add an attribute card to begin the logical expression.</div>
      </div>
      <span class="tower-badge valid">Ready</span>
    `;
    elements.towerLevels.appendChild(empty);
    elements.expressionOutput.textContent = "No levels added yet.";
    return;
  }

  const selectedObject = getSelectedObject();
  const groupedTower = buildGroups(state.tower);
  const levelValidityMap = new Map();

  groupedTower.forEach((group) => {
    const groupIsTrue = group.items.some((level) => evaluateLevel(level, selectedObject));
    group.indexes.forEach((index) => levelValidityMap.set(index, groupIsTrue));
  });

  state.tower.forEach((level, index) => {
    const item = document.createElement("li");
    item.className = "tower-item";
    const valid = levelValidityMap.get(index);
    const connectorText = index === 0 ? "Start" : level.connector;
    const groupNote = level.connector === "OR" || state.tower[index + 1]?.connector === "OR"
      ? " | grouped OR condition"
      : "";
    const ruleText = `${connectorText}${level.negated ? " + NOT" : ""}${groupNote}`;

    item.innerHTML = `
      <span class="tower-index">${index + 1}</span>
      <div>
        <strong>${formatLevelLabel(level, index === 0)}</strong>
        <div class="tower-rule">${ruleText}</div>
      </div>
      <span class="tower-badge ${valid ? "valid" : "invalid"}">${valid ? "True" : "Challengeable"}</span>
    `;
    elements.towerLevels.appendChild(item);
  });

  elements.expressionOutput.textContent = formatExpression(state.tower);
}

function renderFeedback(message) {
  const evaluation = evaluateTower(state.tower, getSelectedObject());
  const defaultMessage = summarizeRuleFeedback(evaluation);
  elements.ruleFeedback.textContent = message ? `${message} ${defaultMessage}` : defaultMessage;

  const matchingObjects = OBJECTS.filter((item) => evaluateTower(state.tower, item).expressionIsTrue);

  if (state.tower.length === 0) {
    elements.candidateFeedback.textContent = "Your tower currently matches every sample object because no evidence has been added yet.";
    return;
  }

  if (matchingObjects.length === 0) {
    elements.candidateFeedback.textContent = "Your tower matches 0 sample objects, which means the current expression is inconsistent with this sample set.";
    return;
  }

  const names = matchingObjects.map((item) => item.name);
  const intro = `Your tower matches ${matchingObjects.length} sample object${matchingObjects.length === 1 ? "" : "s"}: `;
  elements.candidateFeedback.textContent = intro + names.join(", ") + ".";
}

function updateButtons() {
  const canDraw = state.hand.length < 7 && state.deck.length > 0;
  const canTakeDiscard = state.hand.length < 7 && state.discard.length > 0;
  const hasSelection = state.selectedHandIndex !== null;
  const hasTower = state.tower.length > 0;

  elements.drawDeckButton.disabled = !canDraw;
  elements.drawDiscardButton.disabled = !canTakeDiscard;
  elements.discardButton.disabled = !hasSelection;
  elements.removeTopButton.disabled = !hasTower;
  elements.buildButton.disabled = !hasSelection;
}

function getSelectedObject() {
  return OBJECTS.find((item) => item.name === state.selectedObject) ?? OBJECTS[0];
}

function evaluateLevel(level, object) {
  const hasAttribute = object.attributes.includes(level.attribute);
  return level.negated ? !hasAttribute : hasAttribute;
}

function evaluateTower(levels, object) {
  const groups = buildGroups(levels);
  const groupResults = groups.map((group) => group.items.some((level) => evaluateLevel(level, object)));
  const notCount = levels.filter((level) => level.negated).length;
  const orCount = levels.filter((level) => level.connector === "OR").length;
  const positiveCount = levels.filter((level) => !level.negated).length;

  const chainedOr = levels.some(
    (level, index) => index > 0 && level.connector === "OR" && levels[index - 1]?.connector === "OR"
  );

  return {
    expressionIsTrue: groupResults.every(Boolean),
    notCount,
    orCount,
    positiveCount,
    heightComplete: levels.length === 5,
    hasTooManyNots: notCount > 2,
    hasTooManyOrs: orCount > 1,
    hasEnoughPositiveLevels: positiveCount >= 3,
    hasChainedOr: chainedOr,
    groups
  };
}

function buildGroups(levels) {
  const groups = [];

  levels.forEach((level, index) => {
    if (index > 0 && level.connector === "OR" && groups.length > 0) {
      groups[groups.length - 1].items.push(level);
      groups[groups.length - 1].indexes.push(index);
      return;
    }

    groups.push({
      items: [level],
      indexes: [index]
    });
  });

  return groups;
}

function summarizeRuleFeedback(evaluation) {
  if (state.tower.length === 0) {
    return "Start by choosing a card from your hand and adding the first tower level.";
  }

  if (evaluation.hasChainedOr) {
    return "This tower breaks the OR rule. OR can only connect to the most recent attribute once.";
  }

  if (evaluation.hasTooManyOrs) {
    return "This tower uses OR too many times. The limit is one OR group per tower.";
  }

  if (evaluation.hasTooManyNots) {
    return "This tower uses NOT too many times. The limit is two negations.";
  }

  if (!evaluation.expressionIsTrue) {
    return "At least one level is false for the selected object, so another player could challenge this tower.";
  }

  if (!evaluation.heightComplete) {
    return "The tower is currently valid for the selected object. Add more levels until you reach five.";
  }

  if (!evaluation.hasEnoughPositiveLevels) {
    return "The tower needs at least three positive attributes even though the expression is otherwise valid.";
  }

  return "This is a valid five-level tower for the selected object and would be ready for reveal and group validation.";
}

function formatLevelLabel(level, isFirst) {
  const prefix = isFirst ? "" : `${level.connector} `;
  const notText = level.negated ? "NOT " : "";
  return `${prefix}${notText}${level.attribute}`;
}

function formatExpression(levels) {
  const groups = buildGroups(levels);

  return groups
    .map((group) => {
      const groupText = group.items
        .map((level) => `${level.negated ? "NOT " : ""}${level.attribute}`)
        .join(" OR ");

      return group.items.length > 1 ? `(${groupText})` : groupText;
    })
    .join(" AND ");
}
