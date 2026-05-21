let currentUser = null;
let socket = null;
let currentView = 'home';
let map = null;

// DOM Elements
const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

// Initialize App
async function init() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            currentUser = await api.auth.getMe();
            setupSocket();
            navigate('home');
        } catch (err) {
            localStorage.removeItem('token');
            navigate('login');
        }
    } else {
        navigate('login');
    }
}

function setupSocket() {
    socket = io();
    socket.emit('join', currentUser._id);
    socket.on('receiveMessage', (data) => {
        if (currentView === 'chat-room' && activeChatUserId === data.senderId) {
            appendMessage(data, 'received');
        } else {
            showNotification(`New message from ${data.senderId}`);
        }
    });
}

// Navigation
function navigate(view, params = {}) {
    currentView = view;
    updateNavUI(view);
    
    switch(view) {
        case 'home': renderHome(); break;
        case 'login': renderLogin(); break;
        case 'register': renderRegister(); break;
        case 'profile': renderProfile(); break;
        case 'map': renderMap(); break;
        case 'chat': renderChatList(); break;
        case 'chat-room': renderChatRoom(params.userId); break;
        case 'create': renderCreatePost(); break;
        case 'search': renderSearch(); break;
    }
}

function updateNavUI(view) {
    navItems.forEach(item => {
        const text = item.querySelector('span')?.innerText.toLowerCase();
        if (text === view) item.classList.add('active');
        else item.classList.remove('active');
    });
}

// Views
async function renderHome() {
    mainContent.innerHTML = `
        <div class="stories-bar" id="stories-container"></div>
        <div class="category-pills">
            <div class="pill active" onclick="filterPosts('All', this)">All</div>
            <div class="pill" onclick="filterPosts('Love', this)">Love</div>
            <div class="pill" onclick="filterPosts('Sad', this)">Sad</div>
            <div class="pill" onclick="filterPosts('Motivational', this)">Motivational</div>
            <div class="pill" onclick="filterPosts('Islamic', this)">Islamic</div>
            <div class="pill" onclick="filterPosts('Funny', this)">Funny</div>
        </div>
        <div id="posts-container"></div>
        <div class="ad-banner">AdMob Banner Placeholder</div>
    `;
    loadStories();
    loadPosts();
}

async function loadStories() {
    const container = document.getElementById('stories-container');
    const stories = await api.stories.getAll();
    container.innerHTML = `
        <div class="story-item" onclick="navigate('create-story')">
            <div class="story-img" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;border-style:dashed;">+</div>
            <div style="font-size:0.7rem">Your Story</div>
        </div>
    ` + stories.map(s => `
        <div class="story-item">
            <img src="${s.user.profilePhoto}" class="story-img">
            <div style="font-size:0.7rem">${s.user.username}</div>
        </div>
    `).join('');
}

async function loadPosts(category = 'All') {
    const container = document.getElementById('posts-container');
    container.innerHTML = '<div style="text-align:center;padding:20px;">Loading posts...</div>';
    const posts = await api.posts.getAll(category);
    container.innerHTML = posts.map(p => renderPostCard(p)).join('');
}

function renderPostCard(p) {
    const isLiked = p.likes.includes(currentUser?._id);
    const isSaved = currentUser?.favorites?.includes(p._id);
    return `
        <div class="post-card">
            <div class="post-header">
                <img src="${p.user.profilePhoto}" class="user-avatar">
                <strong>${p.user.username}</strong>
            </div>
            <div class="post-content">${p.content}</div>
            ${p.type === 'image' ? `<div class="post-media"><img src="${p.content}"></div>` : ''}
            ${p.type === 'video' ? `<div class="post-media"><video src="${p.content}" controls></video></div>` : ''}
            <div class="post-actions">
                <div class="action-item ${isLiked ? 'liked' : ''}" onclick="likePost('${p._id}', this)">
                    <i class="fas fa-heart"></i> <span>${p.likes.length}</span>
                </div>
                <div class="action-item" onclick="showComments('${p._id}')">
                    <i class="fas fa-comment"></i> <span>${p.comments.length}</span>
                </div>
                <div class="action-item ${isSaved ? 'liked' : ''}" onclick="toggleSave('${p._id}', this)">
                    <i class="fas fa-bookmark"></i>
                </div>
                <div class="action-item">
                    <i class="fas fa-share"></i>
                </div>
            </div>
        </div>
    `;
}

async function toggleSave(id, el) {
    if (!currentUser) return navigate('login');
    // We'll add a simple favorite toggle in user profile
    const res = await api.request(`/users/favorite/${id}`, 'POST');
    currentUser = res;
    el.classList.toggle('liked');
}

async function filterPosts(category, el) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    loadPosts(category);
}

async function likePost(id, el) {
    if (!currentUser) return navigate('login');
    const post = await api.posts.like(id);
    const count = el.querySelector('span');
    count.innerText = post.likes.length;
    el.classList.toggle('liked');
}

// Auth Views
function renderLogin() {
    mainContent.innerHTML = `
        <div class="auth-container">
            <h2 style="margin-bottom:20px">Login</h2>
            <form class="auth-form" onsubmit="handleLogin(event)">
                <div class="form-group"><input type="email" placeholder="Email" id="login-email" required></div>
                <div class="form-group"><input type="password" placeholder="Password" id="login-pass" required></div>
                <button type="submit">Login</button>
            </form>
            <div class="auth-link" onclick="navigate('register')">New user? Register here</div>
        </div>
    `;
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    try {
        const res = await api.auth.login({ email, password });
        localStorage.setItem('token', res.token);
        currentUser = res.user;
        setupSocket();
        navigate('home');
    } catch (err) {
        alert(err.message);
    }
}

function renderRegister() {
    mainContent.innerHTML = `
        <div class="auth-container">
            <h2 style="margin-bottom:20px">Register</h2>
            <form class="auth-form" onsubmit="handleRegister(event)">
                <div class="form-group"><input type="text" placeholder="Username" id="reg-name" required></div>
                <div class="form-group"><input type="email" placeholder="Email" id="reg-email" required></div>
                <div class="form-group"><input type="password" placeholder="Password" id="reg-pass" required></div>
                <button type="submit">Register</button>
            </form>
            <div class="auth-link" onclick="navigate('login')">Already have an account? Login</div>
        </div>
    `;
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;
    try {
        const res = await api.auth.register({ username, email, password });
        localStorage.setItem('token', res.token);
        currentUser = res.user;
        setupSocket();
        navigate('home');
    } catch (err) {
        alert(err.message);
    }
}

// Profile View
async function renderProfile() {
    if (!currentUser) return navigate('login');
    mainContent.innerHTML = `
        <div class="profile-header">
            <img src="${currentUser.profilePhoto}" class="profile-avatar">
            <h2>${currentUser.username}</h2>
            <p class="bio">${currentUser.bio || 'No bio yet'}</p>
            <button style="width:auto;padding:5px 20px" onclick="editProfile()">Edit Profile</button>
            <button style="width:auto;padding:5px 20px;background:#ff7675;margin-left:10px" onclick="logout()">Logout</button>
        </div>
        <div id="user-posts" style="padding-top:10px"></div>
    `;
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    navigate('login');
}

// Map View
function renderMap() {
    mainContent.innerHTML = `<div id="map-container"></div>`;
    if (!navigator.geolocation) return alert('Geolocation not supported');

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { longitude, latitude } = pos.coords;
        if (map) map.remove();
        map = L.map('map-container').setView([latitude, longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Update user location in DB
        await api.users.updateProfile(buildFormData({ location: JSON.stringify({ lng: longitude, lat: latitude }) }));

        const nearby = await api.users.getNearby(longitude, latitude);
        nearby.forEach(u => {
            if (u.location && u.location.coordinates) {
                const [lng, lat] = u.location.coordinates;
                L.marker([lat, lng]).addTo(map)
                    .bindPopup(`<b>${u.username}</b><br>${u.bio}<br><button onclick="navigate('chat-room', {userId:'${u._id}'})">Message</button>`);
            }
        });
    });
}

// Chat Views
async function renderChatList() {
    if (!currentUser) return navigate('login');
    mainContent.innerHTML = '<div style="padding:15px"><h3>Chats</h3></div><div id="chat-list"></div>';
    const recent = await api.chat.getRecent();
    const container = document.getElementById('chat-list');
    container.innerHTML = recent.map(u => `
        <div class="chat-list-item" onclick="navigate('chat-room', {userId:'${u._id}'})">
            <img src="${u.profilePhoto}" class="user-avatar">
            <strong>${u.username}</strong>
        </div>
    `).join('');
}

let activeChatUserId = null;
async function renderChatRoom(userId) {
    activeChatUserId = userId;
    mainContent.innerHTML = `
        <div class="chat-room">
            <div id="chat-messages" class="messages-container"></div>
            <div class="chat-input">
                <input type="text" id="msg-input" placeholder="Type a message...">
                <button style="width:auto;margin-left:10px" onclick="sendChatMessage()">Send</button>
            </div>
        </div>
    `;
    const history = await api.chat.getHistory(userId);
    const container = document.getElementById('chat-messages');
    history.forEach(m => appendMessage(m, m.sender === currentUser._id ? 'sent' : 'received'));
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;
    const data = { senderId: currentUser._id, receiverId: activeChatUserId, text };
    socket.emit('sendMessage', data);
    appendMessage(data, 'sent');
    input.value = '';
}

function appendMessage(data, type) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = data.text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Create Post View
function renderCreatePost() {
    if (!currentUser) return navigate('login');
    mainContent.innerHTML = `
        <div style="padding:20px">
            <h2>Create Post</h2>
            <div class="form-group">
                <select id="post-type" onchange="togglePostMedia()">
                    <option value="text">Text Quote</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                </select>
            </div>
            <div class="form-group"><textarea id="post-text" placeholder="Write your quote..."></textarea></div>
            <div class="form-group hidden" id="media-group"><input type="file" id="post-file"></div>
            <div class="form-group">
                <select id="post-cat">
                    <option value="General">General</option>
                    <option value="Love">Love</option>
                    <option value="Sad">Sad</option>
                    <option value="Motivational">Motivational</option>
                    <option value="Islamic">Islamic</option>
                    <option value="Funny">Funny</option>
                </select>
            </div>
            <button onclick="submitPost()">Post</button>
        </div>
    `;
}

function togglePostMedia() {
    const type = document.getElementById('post-type').value;
    document.getElementById('media-group').classList.toggle('hidden', type === 'text');
}

async function submitPost() {
    const type = document.getElementById('post-type').value;
    const text = document.getElementById('post-text').value;
    const file = document.getElementById('post-file').files[0];
    const cat = document.getElementById('post-cat').value;

    const formData = new FormData();
    formData.append('type', type);
    formData.append('content', text);
    formData.append('categories', JSON.stringify([cat]));
    if (file) formData.append('postMedia', file);

    await api.posts.create(formData);
    navigate('home');
}

// Helpers
function buildFormData(obj) {
    const fd = new FormData();
    for(let key in obj) fd.append(key, obj[key]);
    return fd;
}

async function renderSearch() {
    mainContent.innerHTML = `
        <div style="padding:15px">
            <div class="form-group"><input type="text" id="search-input" placeholder="Search users..." oninput="handleSearch(this.value)"></div>
            <div id="search-results"></div>
        </div>
    `;
}

async function editProfile() {
    mainContent.innerHTML = `
        <div style="padding:20px">
            <h2>Edit Profile</h2>
            <div class="form-group"><input type="text" id="edit-bio" placeholder="Bio" value="${currentUser.bio || ''}"></div>
            <div class="form-group">
                <label>Profile Photo</label>
                <input type="file" id="edit-photo">
            </div>
            <button onclick="saveProfile()">Save Changes</button>
            <button style="background:#gray;margin-top:10px" onclick="navigate('profile')">Cancel</button>
        </div>
    `;
}

async function saveProfile() {
    const bio = document.getElementById('edit-bio').value;
    const photo = document.getElementById('edit-photo').files[0];

    const formData = new FormData();
    formData.append('bio', bio);
    if (photo) formData.append('profilePhoto', photo);

    try {
        currentUser = await api.users.updateProfile(formData);
        navigate('profile');
    } catch (err) {
        alert(err.message);
    }
}

async function showComments(postId) {
    const posts = await api.posts.getAll();
    const post = posts.find(p => p._id === postId);
    
    mainContent.innerHTML = `
        <div style="padding:15px">
            <button onclick="navigate('home')">Back</button>
            <h3 style="margin:15px 0">Comments</h3>
            <div id="comments-list">
                ${post.comments.map(c => `
                    <div style="margin-bottom:10px;padding:10px;background:#fff;border-radius:8px;">
                        <strong>${c.user?.username || 'User'}:</strong> ${c.text}
                    </div>
                `).join('')}
            </div>
            <div class="chat-input" style="position:sticky;bottom:0">
                <input type="text" id="comment-input" placeholder="Add a comment...">
                <button style="width:auto" onclick="submitComment('${postId}')">Send</button>
            </div>
        </div>
    `;
}

async function submitComment(postId) {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;
    await api.posts.comment(postId, text);
    showComments(postId);
}

function showNotification(msg) {
    console.log('Notification:', msg);
}

// Start App
init();
