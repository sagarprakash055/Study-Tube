// 1. State Management
let videos = JSON.parse(localStorage.getItem('studytube_videos') || '[]');
let activeFilter = 'All';

// 2. Helper: Extract YouTube ID
function getYouTubeId(url) {
  try {
    let parsedUrl = new URL(url);
    // Works for both 'youtube.com?v=ID' and 'youtu.be/ID'
    return parsedUrl.searchParams.get('v') || parsedUrl.pathname.substring(1);
  } catch (e) {
    return null;
  }
}

// 3. Helper: Show Messages
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// 4. Main Actions
function addVideo() {
  const url = document.getElementById('url-input').value.trim();
  const subject = document.getElementById('subject-input').value;
  const title = document.getElementById('title-input').value.trim() || 'Saved Video';

  const id = getYouTubeId(url);
  if (!id) return showToast('Invalid YouTube URL');

  // Check for duplicates
  if (videos.some(v => v.id === id)) return showToast('Already saved!');

  // Save new video
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  videos.unshift({ id, url, title, subject, date });
  localStorage.setItem('studytube_videos', JSON.stringify(videos));

  // Clear inputs and update screen
  document.getElementById('url-input').value = '';
  document.getElementById('title-input').value = '';
  showToast('Video added!');
  updateUI();
}

function deleteVideo(id) {
  videos = videos.filter(v => v.id !== id);
  localStorage.setItem('studytube_videos', JSON.stringify(videos));
  showToast('Video removed');
  updateUI();
}

function setFilter(subject) {
  activeFilter = subject;
  updateUI();
}

// 5. Render the Screen (Filters & Grid)
function updateUI() {
  // --- Render Filters ---
  const subjects = ['All', ...new Set(videos.map(v => v.subject))];
  const tabsHTML = subjects.map(sub => 
    `<button class="filter-tab ${sub === activeFilter ? 'active' : ''}" onclick="setFilter('${sub}')">${sub}</button>`
  ).join('');
  document.getElementById('filter-tabs').innerHTML = tabsHTML;
  document.getElementById('header-count').textContent = videos.length;

  // --- Render Video Grid ---
  const grid = document.getElementById('grid');
  const filteredVideos = activeFilter === 'All' ? videos : videos.filter(v => v.subject === activeFilter);

  if (filteredVideos.length === 0) {
    grid.innerHTML = `<div class="empty"><h2>No videos in ${activeFilter}</h2></div>`;
    return;
  }

  grid.innerHTML = filteredVideos.map(v => `
    <div class="card">
      <div class="thumb-wrap">
        <a href="${v.url}" target="_blank">
          <img src="https://img.youtube.com/vi/${v.id}/hqdefault.jpg" alt="${v.title}">
        </a>
        <span class="subject-badge">${v.subject}</span>
      </div>
      <div class="card-body">
        <a href="${v.url}" target="_blank" class="card-title">${v.title}</a>
        <div class="card-meta">${v.date}</div>
        <button class="btn btn-danger" onclick="deleteVideo('${v.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

// 6. Listen for Enter Key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.target.id === 'url-input' || e.target.id === 'title-input')) {
    addVideo();
  }
});

// Initialize app on load
updateUI();