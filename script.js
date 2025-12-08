// --------------------------------------------
// Firebase Imports
// --------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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

// Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --------------------------------------------
// Page Elements
// --------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const teamId = urlParams.get('team') || "team1";

const gridBody = document.querySelector('#availability-grid tbody');
const timezoneSelect = document.getElementById('timezone');
const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');
const playerInput = document.getElementById('player-name');

document.getElementById("team-name").innerText = `Availability: ${teamId}`;

// Grid variables
const startHour = 0;
const endHour = 23;
let gridData = [];

// Firestore reference
const teamRef = doc(db, 'teams', teamId);

// --------------------------------------------
// Helpers: Firestore <-> Grid Converters
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

// Convert Firestore objects back into arrays
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
// Grid Rendering
// --------------------------------------------
function populateGrid(data) {
  gridBody.innerHTML = '';
  gridData = firestoreObjectToGrid(data);

  for (let hour = startHour; hour <= endHour; hour++) {
    const row = document.createElement('tr');

    // Time column
    const timeCell = document.createElement('td');
    timeCell.textContent = `${hour}:00`;
    row.appendChild(timeCell);

    // 7 days
    for (let day = 0; day < 7; day++) {
      const isAvailable = gridData[hour][day];
      const cell = document.createElement('td');

      cell.classList.add(isAvailable ? 'available' : 'unavailable');

      // Toggle on click
      cell.addEventListener('click', () => {
        gridData[hour][day] = !gridData[hour][day];
        cell.classList.toggle('available');
        cell.classList.toggle('unavailable');
      });

      row.appendChild(cell);
    }

    gridBody.appendChild(row);
  }
}

// --------------------------------------------
// Firestore Load / Save
// --------------------------------------------

// Load a player's saved grid
async function loadPlayerData(name) {
  if (!name) return alert("Enter a name!");

  const snap = await getDoc(teamRef);
  const stored = snap.exists() ? snap.data().players?.[name] : null;

  populateGrid(stored || {});
}

// Save a player's availability
async function savePlayerData(name) {
  if (!name) return alert("Enter a name!");

  const firestoreGrid = gridToFirestoreObject(gridData);

  await setDoc(
    teamRef,
    { players: { [name]: firestoreGrid } },
    { merge: true }
  );

  alert("Saved!");
}

// --------------------------------------------
// Event Bindings
// --------------------------------------------
loadButton.addEventListener('click', () => {
  const name = playerInput.value.trim();
  loadPlayerData(name);
});

saveButton.addEventListener('click', () => {
  const name = playerInput.value.trim();
  savePlayerData(name);
});

// --------------------------------------------
// Initialize with empty grid
// --------------------------------------------
populateGrid({});
