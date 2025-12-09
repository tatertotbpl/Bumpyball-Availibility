// --------------------------------------------
// Firebase Imports
// --------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
  getFirestore, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// --------------------------------------------
// Firebase Config
// --------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAlpvgPbox4IvXQ74uvT7wx_Zv2ARwXaYY",
  authDomain: "smashkarts-availability.firebaseapp.com",
  projectId: "smashkarts-availability",
  storageBucket: "smashkarts-availability.firebasestorage.app",
  messagingSenderId: "33863251672",
  appId: "1:33863251672:web:ffc0d728fe31321c0809ad",
  measurementId: "G-8K3MEHMLRN"
};

// Init Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --------------------------------------------
// Page Elements
// --------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const teamId = urlParams.get("team") || "team1";

const gridBody = document.querySelector("#availability-grid tbody");
const timezoneSelect = document.getElementById("timezone");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const playerInput = document.getElementById("player-name");

document.getElementById("team-name").innerText = `Availability: ${teamId}`;

// Grid setup
const startHour = 0;
const endHour = 23;
let gridData = [];

// --------------------------------------------
// Firestore Paths
// --------------------------------------------
function playerDocRef(playerName) {
  return doc(db, "teams", teamId, "players", playerName);
}

// --------------------------------------------
// Helpers: Grid <-> Firestore conversion
// --------------------------------------------

// Convert grid arrays into Firestore-safe objects
function gridToFirestoreObject(grid) {
  const out = {};
  for (let h = 0; h < 24; h++) {
    out[h] = {};
    for (let d = 0; d < 7; d++) {
      out[h][d] = !!grid[h][d];
    }
  }
  return out;
}

// Convert from Firestore object → JS grid
function firestoreObjectToGrid(obj) {
  const grid = [];
  for (let h = 0; h < 24; h++) {
    grid[h] = [];
    for (let d = 0; d < 7; d++) {
      grid[h][d] = obj?.[h]?.[d] || false;
    }
  }
  return grid;
}

// --------------------------------------------
// Grid rendering
// --------------------------------------------
function populateGrid(data) {
  gridBody.innerHTML = "";
  gridData = firestoreObjectToGrid(data);

  for (let hour = startHour; hour <= endHour; hour++) {
    const row = document.createElement("tr");

    // Time cell
    const timeCell = document.createElement("td");
    timeCell.textContent = `${hour}:00`;
    row.appendChild(timeCell);

    // 7 days
    for (let day = 0; day < 7; day++) {
      const isAvailable = gridData[hour][day];
      const cell = document.createElement("td");

      cell.classList.add(isAvailable ? "available" : "unavailable");

      cell.addEventListener("click", () => {
        gridData[hour][day] = !gridData[hour][day];
        cell.classList.toggle("available");
        cell.classList.toggle("unavailable");
      });

      row.appendChild(cell);
    }

    gridBody.appendChild(row);
  }
}

// --------------------------------------------
// Firestore Load / Save
// --------------------------------------------

// Load saved data for a player
async function loadPlayerData(name) {
  if (!name) return alert("Enter a name!");

  const ref = playerDocRef(name);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    populateGrid({});
    alert("No data found — starting fresh.");
    return;
  }

  const data = snap.data();
  populateGrid(data.grid || {});

  if (data.timezone) timezoneSelect.value = data.timezone;
  if (data.displayName) playerInput.value = data.displayName;
}

// Save availability + timezone + name
async function savePlayerData(name) {
  if (!name) return alert("Enter a name!");

  const firestoreGrid = gridToFirestoreObject(gridData);

  const ref = playerDocRef(name);

  await setDoc(ref, {
    grid: firestoreGrid,
    timezone: timezoneSelect.value,
    displayName: name,
    updatedAt: Date.now()
  });

  alert("Saved!");
}

// --------------------------------------------
// Event Listeners
// --------------------------------------------
loadButton.addEventListener("click", () => {
  const name = playerInput.value.trim();
  loadPlayerData(name);
});

saveButton.addEventListener("click", () => {
  const name = playerInput.value.trim();
  savePlayerData(name);
});

// --------------------------------------------
// Initialize empty grid
// --------------------------------------------
populateGrid({});
