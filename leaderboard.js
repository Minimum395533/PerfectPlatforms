let allPlayers = [];      // To store the data after fetching
let currentSortKey = '';  // To track which column is active
let isAscending = false;  // To track the direction (High->Low or Low->High)
function sortData(key) {
    // SPECIAL CASE: If 'rank' is pressed, reset to default competitive sorting
    if (key === 'rank') {
        currentSortKey = 'rank';
        isAscending = false; // We don't toggle rank; it just resets

        allPlayers.sort((a, b) => {
            // 1. Winners (0) always beat non-winners
            if (a.score === 0 && b.score !== 0) return -1;
            if (b.score === 0 && a.score !== 0) return 1;

            // 2. If both are losers, higher level (score) is better
            if (b.score !== a.score) return b.score - a.score;

            // 3. Tie-breaker: Lower time is better
            return a.Time - b.Time;
        });

        renderTable(allPlayers);
        return; // Exit the function early
    }

    // --- Standard Sorting for other columns ---
    if (currentSortKey === key) {
        isAscending = !isAscending;
    } else {
        currentSortKey = key;
        isAscending = false; 
    }

    allPlayers.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (key === 'playerName') {
            return isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        // Standard numeric sort for Lives, Jumps, Time, etc.
        return isAscending ? valA - valB : valB - valA;
    });

    renderTable(allPlayers);
}
function renderTable(data) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    data.forEach((player, index) => {
        const rank = index + 1;
        const row = document.createElement('tr');

        const dateObj = new Date(player.dateTime * 1000);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        let rankClass = 'rank-badge';
        if (rank === 1) rankClass += ' rank-1';
        else if (rank === 2) rankClass += ' rank-2';
        else if (rank === 3) rankClass += ' rank-3';

        row.innerHTML = `
            <td><span class="${rankClass}">${rank}</span></td>
            <td><strong>${escapeHtml(player.playerName)}</strong></td>
            <td>${player.score}</td>
            <td>${Number(player.Time).toFixed(2)}</td>
            <td>${player.Livesremaining}</td>
            <td>${player.TotalJumps}</td>
            <td>${formattedDate}</td>
        `;
        tbody.appendChild(row);
    });
}
//<-- L3-WN-Table Rendering-3/13/26 -->
async function loadLeaderboard() {
  try {
      const response = await fetch(`get_leaderboard.php?t=${Date.now()}`, { cache: 'no-store' });
      allPlayers = await response.json(); // Save to our global variable

      // Initial Sort: Winners (0) first, then furthest level (highest number)
      allPlayers.sort((a, b) => {
          // If one is a winner (0) and the other isn't, winner comes first
          if (a.score === 0 && b.score !== 0) return -1;
          if (b.score === 0 && a.score !== 0) return 1;

          // If both are winners or both are losers, sort by Level (Descending)
          if (b.score !== a.score) return b.score - a.score;

          // Tie-breaker: Fastest time (Ascending)
          return a.Time - b.Time;
      });
      renderTable(allPlayers); // Call the new render function
  } catch (error) {
      console.error('Error loading leaderboard:', error);
      document.getElementById('leaderboardBody').innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading leaderboard data</td></tr>';
  }
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

loadLeaderboard();
// Attach click listeners to the headers after the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const key = header.getAttribute('data-sort');
            sortData(key);
        });
    });
});