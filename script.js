<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smashkarts Team Availability</title>
  <link rel="stylesheet" href="style.css">
  <style>
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #333; padding: 5px; text-align: center; }
    .available { background-color: #6f6; }
    .unavailable { background-color: #f66; }
    input { margin-bottom: 10px; }
  </style>
</head>
<body>
  <h1 id="team-name">Team Availability</h1>

  <div class="player-input">
    <label for="player-name">Player Name:</label>
    <input type="text" id="player-name" placeholder="Your Name">
  </div>

  <div class="timezone-selector">
    <label for="timezone">Select your timezone:</label>
    <select id="timezone">
      <option value="UTC">UTC</option>
      <option value="America/New_York">EST</option>
      <option value="America/Los_Angeles">PST</option>
      <option value="Europe/London">GMT</option>
      <option value="Europe/Berlin">CET</option>
      <option value="Asia/Tokyo">JST</option>
    </select>
  </div>

  <table id="availability-grid">
    <thead>
      <tr>
        <th>Time</th>
        <th>Mon</th>
        <th>Tue</th>
        <th>Wed</th>
        <th>Thu</th>
        <th>Fri</th>
        <th>Sat</th>
        <th>Sun</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>

  <button id="saveButton">Save Availability</button>

  <script type="module">
    // Modular Firebase SDK imports
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
    import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

    // Firebase config - replace with your project values
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Get team from URL
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team') || "team1"; // default team
    document.getElementById("team-name").innerText = `Availability: ${teamId}`;

    const gridBody = document.querySelector('#availability-grid tbody');
    const timezoneSelect = document.getElementById('timezone');
    const saveButton = document.getElementById('saveButton');
    const playerInput = document.getElementById('player-name');

    const startHour = 0;
    const endHour = 23;
    let gridData = [];

    // Populate grid
    function populateGrid(data) {
      gridBody.innerHTML = '';
      for (let hour = startHour; hour <= endHour; hour++) {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = `${hour}:00`;
        row.appendChild(timeCell);

        gridData[hour] = gridData[hour] || [];
        for (let day = 0; day < 7; day++) {
          const cell = document.createElement('td');
          const available = data?.[hour]?.[day] || false;
          cell.classList.add(available ? 'available' : 'unavailable');

          cell.addEventListener('click', () => {
            cell.classList.toggle('available');
            cell.classList.toggle('unavailable');
            gridData[hour][day] = !gridData[hour][day];
          });

          gridData[hour][day] = available;
          row.appendChild(cell);
        }
        gridBody.appendChild(row);
      }
    }

    // Firestore document reference
    const teamRef = doc(db, 'teams', teamId);

    async function loadPlayerData(playerName) {
      if (!playerName) return;
      const snap = await getDoc(teamRef);
      const playerGrid = snap.exists() ? snap.data().players?.[playerName] || [] : [];
      populateGrid(playerGrid);
    }

    async function savePlayerData(playerName) {
      if (!playerName) { alert('Enter your name!'); return; }
      await setDoc(teamRef, { players: { [playerName]: gridData } }, { merge: true });
      alert('Availability saved!');
    }

    // Load grid when player name changes
    playerInput.addEventListener('change', () => loadPlayerData(playerInput.value.trim()));

    // Save button
    saveButton.addEventListener('click', () => savePlayerData(playerInput.value.trim()));

    // Timezone placeholder
    timezoneSelect.addEventListener('change', () => {
      console.log('Selected timezone:', timezoneSelect.value);
      // implement timezone conversion here if desired
    });

    // Initialize empty grid
    populateGrid([]);
  </script>
</body>
</html>
