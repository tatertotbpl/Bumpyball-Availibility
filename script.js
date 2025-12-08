// Get team from URL
const urlParams = new URLSearchParams(window.location.search);
const teamId = urlParams.get('team') || "team1"; // default team1

// Optional: update header
document.getElementById("team-name").innerText = `Availability: ${teamId}`;

// Firebase config (replace with your actual keys)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.addEventListener('DOMContentLoaded', () => {
    const gridBody = document.querySelector('#availability-grid tbody');
    const timezoneSelect = document.getElementById('timezone');
    const saveButton = document.getElementById('saveButton');

    const startHour = 0; // 12 AM
    const endHour = 23;  // 11 PM
    let gridData = []; // 2D array to store availability

    // Function to populate the table from gridData
    function populateGrid(data) {
        gridBody.innerHTML = '';
        for (let hour = startHour; hour <= endHour; hour++) {
            const row = document.createElement('tr');

            // Time column
            const timeCell = document.createElement('td');
            timeCell.textContent = `${hour}:00`;
            row.appendChild(timeCell);

            // Day columns
            gridData[hour] = gridData[hour] || [];
            for (let day = 0; day < 7; day++) {
                const cell = document.createElement('td');
                const available = data?.[hour]?.[day] || false;
                cell.classList.add(available ? 'available' : 'unavailable');

                // Click toggles availability
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

    // Load availability from Firebase
    const teamDoc = db.collection('teams').doc(teamId);
    teamDoc.get().then(doc => {
        if (doc.exists) {
            populateGrid(doc.data().availability);
        } else {
            // No data yet, create empty grid
            populateGrid([]);
        }
    });

    // Save availability to Firebase
    saveButton.addEventListener('click', () => {
        teamDoc.set({ availability: gridData }).then(() => {
            alert('Availability saved!');
        }).catch(err => console.error(err));
    });

    // Timezone change listener (placeholder)
    timezoneSelect.addEventListener('change', () => {
        console.log('Selected timezone:', timezoneSelect.value);
        // Implement timezone conversion if desired
    });
});
