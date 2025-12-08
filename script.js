window.addEventListener('DOMContentLoaded', () => {
    const gridBody = document.querySelector('#availability-grid tbody');
    const timezoneSelect = document.getElementById('timezone');

    const startHour = 0; // 12 AM
    const endHour = 23;  // 11 PM

    // Populate grid rows
    for (let hour = startHour; hour <= endHour; hour++) {
        const row = document.createElement('tr');

        // Time column
        const timeCell = document.createElement('td');
        timeCell.textContent = `${hour}:00`;
        row.appendChild(timeCell);

        // Day columns
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('td');
            cell.classList.add('unavailable'); // start as unavailable
            cell.addEventListener('click', () => {
                cell.classList.toggle('available');
                cell.classList.toggle('unavailable');
            });
            row.appendChild(cell);
        }

        gridBody.appendChild(row);
    }

    // Timezone change listener (placeholder for future enhancement)
    timezoneSelect.addEventListener('change', () => {
        console.log('Selected timezone:', timezoneSelect.value);
        // You can implement timezone conversion logic here
    });
});
