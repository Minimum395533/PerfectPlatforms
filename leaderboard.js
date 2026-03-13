async function loadLeaderboard() {
  try {
      // Pointed to your PHP script with a cache-buster so it's always fresh!
      const response = await fetch(`get_leaderboard.php?t=${Date.now()}`, { cache: 'no-store' });
      const players = await response.json();

      const sorted = players.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.Time - b.Time;
      });



      const tbody = document.getElementById('leaderboardBody');
      tbody.innerHTML = '';

      sorted.forEach((player, index) => {
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