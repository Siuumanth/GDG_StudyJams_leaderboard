const maxBadges = 20;
const targetDate = new Date('2025-10-31');

function updateCountdown() {
    const now = new Date();
    const timeDiff = targetDate - now;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 
    document.getElementById('countdown').textContent = `⏰ ${daysLeft} Day(s) left`;
}

// Function to filter participants based on search input
document.getElementById('search-input').addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();
    const participants = document.querySelectorAll('.participant-info');

    participants.forEach(participant => {
        const name = participant.querySelector('.participant-name').textContent.toLowerCase();
        participant.style.display = name.includes(searchValue) ? 'flex' : 'none'; 
    });
});

// Function to create skill badge cards (FIXED TO SPLIT BY '|')
function createBadgeCards(badgesString) {
    if (!badgesString || badgesString.trim() === '' || badgesString === 'None') {
        return '<p style="color: #8b949e; text-align: center;">No skill badges completed yet</p>';
    }

    // ⭐ FIX: Split by the pipe character '|'
    const badges = badgesString.split('|').map(badge => badge.trim()).filter(badge => badge);
    
    return badges.map((badge) => ` 
        <div class="badge-card">
            <div class="badge-card-icon">🏅</div>
            <div class="badge-card-title">${badge}</div>
        </div>
    `).join('');
}

// Function to create arcade game cards (FIXED TO SPLIT BY '|')
function createArcadeCards(gamesString) {
    if (!gamesString || gamesString.trim() === '' || gamesString === 'None') {
        return '<p style="color: #8b949e; text-align: center;">No arcade games completed yet</p>';
    }

    // ⭐ FIX: Split by the pipe character '|'
    const games = gamesString.split('|').map(game => game.trim()).filter(game => game);
    
    return games.map((game) => `
        <div class="badge-card">
            <div class="badge-card-icon">🎮</div>
            <div class="badge-card-title">${game}</div>
        </div>
    `).join('');
}

// Fetch participant data and populate leaderboard
fetch('data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let completedParticipantsCount = 0;

        data.sort((a, b) =>
            (b['# of Skill Badges Completed'] + b['# of Arcade Games Completed']) -
            (a['# of Skill Badges Completed'] + a['# of Arcade Games Completed'])
        );

        const leaderboardBody = document.getElementById('leaderboard-body');

        data.forEach((participant, index) => {
            const totalBadges = participant['# of Skill Badges Completed'] + participant['# of Arcade Games Completed'];
            const progressPercentage = Math.min((totalBadges / maxBadges) * 100, 100);

            const participantRow = document.createElement('div');
            participantRow.classList.add('participant-info');

            // Add special styling for top 3
            if (index === 0) participantRow.classList.add('rank-1');
            else if (index === 1) participantRow.classList.add('rank-2');
            else if (index === 2) participantRow.classList.add('rank-3');
            
            let rankDisplay = `#${index + 1}`;
            let rankEmoji = '';
            if (index === 0) { rankEmoji = '🥇'; rankDisplay = '1st'; }
            else if (index === 1) { rankEmoji = '🥈'; rankDisplay = '2nd'; }
            else if (index === 2) { rankEmoji = '🥉'; rankDisplay = '3rd'; }

            participantRow.innerHTML = `
                <span class="participant-rank">${rankEmoji ? rankEmoji : rankDisplay}</span>
                <span class="participant-name">${participant['User Name']} 
                    <span class="participant-badges">🌟 x ${totalBadges}</span>
                </span>
                <span class="more-details" data-index="${index}" style="cursor: pointer; margin-left: 10px; color: #58a6ff; font-weight: 600;">▼ Details</span>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${progressPercentage}%;"></div>
                </div>
            `;

            // Add event listener to show modal on click
            participantRow.querySelector('.more-details').addEventListener('click', function() {
                const modalBody = document.getElementById('modal-details-body');
                
                document.getElementById('detailsModalLabel').textContent = `📊 ${participant['User Name']}'s Progress`;
                
                const statsHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Skill Badges Completed:</span>
                        <span class="stat-value">${participant['# of Skill Badges Completed']}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Arcade Games Completed:</span>
                        <span class="stat-value">${participant['# of Arcade Games Completed']}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Badges:</span>
                        <span class="stat-value">${totalBadges} / ${maxBadges}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Progress:</span>
                        <span class="stat-value">${progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Rank:</span>
                        <span class="stat-value">${rankDisplay} ${rankEmoji}</span>
                    </div>
                `;
                
                const badgeCardsHTML = createBadgeCards(participant['Names of Completed Skill Badges']);
                const arcadeCardsHTML = createArcadeCards(participant['Names of Completed Arcade Games']);
                
                // Populate the modal sections
                modalBody.innerHTML = `
                    <div class="details-section">
                        <h6>📈 Statistics</h6>
                        <div id="stats-container">${statsHTML}</div>
                    </div>
                    <div class="details-section">
                        <h6>🏆 Completed Skill Badges</h6>
                        <div id="badges-container" class="badge-cards-container">
                            ${badgeCardsHTML}
                        </div>
                    </div>
                    <div class="details-section">
                        <h6>🎮 Completed Arcade Games</h6>
                        <div id="arcade-container" class="badge-cards-container">
                            ${arcadeCardsHTML}
                        </div>
                    </div>
                  
                `;
                
                // Show the modal
                const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
                detailsModal.show();
            });

            leaderboardBody.appendChild(participantRow);

            if (totalBadges >= maxBadges) {
                completedParticipantsCount++;
            }
        });

        // Update target badges count (progress bar at the top)
        const totalParticipants = data.length;
        const targetProgressPercentage = (completedParticipantsCount / totalParticipants) * 100;

        document.getElementById('target-progress').style.width = `${targetProgressPercentage}%`;
        document.getElementById('target-text').textContent = `✅ Completed: ${completedParticipantsCount} / ${totalParticipants}`;
    })
    .catch(error => {
        console.error('Error loading leaderboard data:', error);
        document.getElementById('leaderboard-body').innerHTML = `
            <p style="color: #f85149; text-align: center; padding: 20px;">
                ⚠️ Error loading leaderboard data. Please ensure 'data.json' exists and is correctly formatted.
            </p>
        `;
    });

// Update countdown every day
updateCountdown();
setInterval(updateCountdown, 1000 * 60 * 60 * 24);