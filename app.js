// Data Storage Keys
const TASKS_STORAGE_KEY = 'creatorflow_tasks';
const SPONSORS_STORAGE_KEY = 'creatorflow_sponsors';

// Clear sample data: Initialize empty arrays if no local data is found
let tasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY)) || [];
let sponsors = JSON.parse(localStorage.getItem(SPONSORS_STORAGE_KEY)) || [];

// DOM Element References
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');

// Task Modal DOM
const taskModal = document.getElementById('task-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const taskForm = document.getElementById('task-form');

// Sponsor Modal DOM
const sponsorModal = document.getElementById('sponsor-modal');
const openSponsorModalBtn = document.getElementById('open-sponsor-modal-btn');
const closeSponsorModalBtn = document.getElementById('close-sponsor-modal-btn');
const cancelSponsorBtn = document.getElementById('cancel-sponsor-btn');
const sponsorForm = document.getElementById('sponsor-form');

const telegramExportBtn = document.getElementById('telegram-export-btn');

// Filters DOM
const searchInput = document.getElementById('search-input');
const filterClient = document.getElementById('filter-client');
const filterPlatform = document.getElementById('filter-platform');

// Navigation Switcher
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active-view'));

        btn.classList.add('active');
        const viewName = btn.getAttribute('data-view');
        document.getElementById(`${viewName}-view`).classList.add('active-view');
    });
});

// Task Modal Handlers
function openModal(task = null) {
    taskForm.reset();
    if (task) {
        document.getElementById('modal-title').innerText = 'កែប្រែ Content';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-client').value = task.client;
        document.getElementById('task-platform').value = task.platform;
        document.getElementById('task-deadline').value = task.deadline;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-drive').value = task.drive || '';
        document.getElementById('task-script').value = task.script || '';
    } else {
        document.getElementById('modal-title').innerText = 'បន្ថែម Content ថ្មី';
        document.getElementById('task-id').value = '';
    }
    taskModal.style.display = 'flex';
}

function closeModal() {
    taskModal.style.display = 'none';
}

openModalBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Sponsor Modal Handlers
function openSponsorModal(sponsor = null) {
    sponsorForm.reset();
    if (sponsor) {
        document.getElementById('sponsor-modal-title').innerText = 'កែប្រែចំណូល / Sponsor';
        document.getElementById('sponsor-id').value = sponsor.id;
        document.getElementById('sponsor-brand').value = sponsor.brand;
        document.getElementById('sponsor-type').value = sponsor.type;
        document.getElementById('sponsor-amount').value = sponsor.amount;
        document.getElementById('sponsor-date').value = sponsor.date;
        document.getElementById('sponsor-status').value = sponsor.status;
    } else {
        document.getElementById('sponsor-modal-title').innerText = 'បន្ថែម Sponsor / ចំណូលថ្មី';
        document.getElementById('sponsor-id').value = '';
        document.getElementById('sponsor-date').value = new Date().toISOString().slice(0, 10);
    }
    sponsorModal.style.display = 'flex';
}

function closeSponsorModal() {
    sponsorModal.style.display = 'none';
}

openSponsorModalBtn.addEventListener('click', () => openSponsorModal());
closeSponsorModalBtn.addEventListener('click', closeSponsorModal);
cancelSponsorBtn.addEventListener('click', closeSponsorModal);

// Close Modals Outside
window.addEventListener('click', (e) => {
    if (e.target === taskModal) closeModal();
    if (e.target === sponsorModal) closeSponsorModal();
});

// Save Tasks to LocalStorage
function saveTasks() {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

// Save Sponsors to LocalStorage
function saveSponsors() {
    localStorage.setItem(SPONSORS_STORAGE_KEY, JSON.stringify(sponsors));
}

// Task Form Submit
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value || 't_' + Date.now().toString();
    const newTask = {
        id,
        title: document.getElementById('task-title').value,
        client: document.getElementById('task-client').value,
        platform: document.getElementById('task-platform').value,
        deadline: document.getElementById('task-deadline').value,
        status: document.getElementById('task-status').value,
        drive: document.getElementById('task-drive').value,
        script: document.getElementById('task-script').value,
    };

    const existingIndex = tasks.findIndex(t => t.id === id);
    if (existingIndex > -1) {
        tasks[existingIndex] = newTask;
    } else {
        tasks.push(newTask);
    }

    saveTasks();
    closeModal();
    renderApp();
});

// Sponsor Form Submit
sponsorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('sponsor-id').value || 's_' + Date.now().toString();
    const newSponsor = {
        id,
        brand: document.getElementById('sponsor-brand').value,
        type: document.getElementById('sponsor-type').value,
        amount: parseFloat(document.getElementById('sponsor-amount').value) || 0,
        date: document.getElementById('sponsor-date').value,
        status: document.getElementById('sponsor-status').value,
    };

    const existingIndex = sponsors.findIndex(s => s.id === id);
    if (existingIndex > -1) {
        sponsors[existingIndex] = newSponsor;
    } else {
        sponsors.push(newSponsor);
    }

    saveSponsors();
    closeSponsorModal();
    renderApp();
});

// Deadline Calculator
function getDeadlineStatus(deadlineStr) {
    if (!deadlineStr) return { label: '-', class: 'badge-normal' };
    const now = new Date();
    const due = new Date(deadlineStr);
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours <= 0) return { label: 'ហួសពេលកំណត់ (Overdue)', class: 'badge-urgent', isUrgent: true };
    if (diffHours <= 24) return { label: `សល់ ${Math.max(1, Math.round(diffHours))} ម៉ោងទៀត`, class: 'badge-urgent', isUrgent: true };
    if (diffHours <= 72) return { label: `សល់ ${Math.round(diffHours / 24)} ថ្ងៃទៀត`, class: 'badge-warning', isWarning: true };
    return { label: `សល់ ${Math.round(diffHours / 24)} ថ្ងៃទៀត`, class: 'badge-normal' };
}

// Delete Operations
function deleteTask(id) {
    if (confirm('តើអ្នកពិតជាចង់លុប Content នេះមែនទេ?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderApp();
    }
}

function deleteSponsor(id) {
    if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យចំណូលនេះមែនទេ?')) {
        sponsors = sponsors.filter(s => s.id !== id);
        saveSponsors();
        renderApp();
    }
}

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) openModal(task);
};

window.editSponsor = function(id) {
    const sponsor = sponsors.find(s => s.id === id);
    if (sponsor) openSponsorModal(sponsor);
};

window.deleteTask = deleteTask;
window.deleteSponsor = deleteSponsor;

// Filter Options Updater
function updateClientFilterOptions() {
    const selected = filterClient.value;
    const clients = [...new Set(tasks.map(t => t.client).filter(Boolean))];
    filterClient.innerHTML = '<option value="">-- Client ទាំងអស់ --</option>';
    clients.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        if (c === selected) option.selected = true;
        filterClient.appendChild(option);
    });
}

// Telegram Export Handler
telegramExportBtn.addEventListener('click', () => {
    const urgentTasks = tasks.filter(t => t.status !== 'Done' && getDeadlineStatus(t.deadline).isUrgent);
    
    let text = `📌 *របាយការណ៍បច្ចុប្បន្នភាព Content (Urgent List)* 📌\n\n`;
    if (urgentTasks.length === 0) {
        text += `✅ ពុំមាន Content ណាប្រញាប់ ឬជិតផុតកំណត់ឡើយ!`;
    } else {
        urgentTasks.forEach((t, i) => {
            const status = getDeadlineStatus(t.deadline);
            text += `${i + 1}. *${t.title}* (${t.client})\n   • Platform: ${t.platform}\n   • Status: ${t.status}\n   • Remaining: ${status.label}\n\n`;
        });
    }

    navigator.clipboard.writeText(text).then(() => {
        alert('បានចម្លង Report សង្ខេបរួចរាល់! អ្នកអាច Paste ផ្ញើទៅ Telegram បានភ្លាមៗ។');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

// JSON Export (Backup Data)
document.getElementById('export-json-btn').addEventListener('click', () => {
    const backupData = {
        tasks,
        sponsors,
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CreatorFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// JSON Import (Restore Data)
document.getElementById('import-json-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = JSON.parse(evt.target.result);
            if (Array.isArray(data.tasks) && Array.isArray(data.sponsors)) {
                tasks = data.tasks;
                sponsors = data.sponsors;
                saveTasks();
                saveSponsors();
                renderApp();
                alert('បញ្ចូលទិន្នន័យបានជោគជ័យ!');
            } else {
                alert('ឯកសារនេះមិនត្រឹមត្រូវតាមទម្រង់ទិន្នន័យឡើយ!');
            }
        } catch (err) {
            alert('មានកំហុសក្នុងការអានឯកសារ JSON!');
        }
    };
    reader.readAsText(file);
});

// UI Rendering Functions
function renderApp() {
    renderDashboard();
    renderKanban();
    renderSponsors();
    updateClientFilterOptions();
}

function renderDashboard() {
    const urgentTasks = tasks.filter(t => t.status !== 'Done' && getDeadlineStatus(t.deadline).isUrgent);
    const warningTasks = tasks.filter(t => t.status !== 'Done' && getDeadlineStatus(t.deadline).isWarning);
    const inProgressTasks = tasks.filter(t => t.status !== 'Done');

    // Calculate Monthly Income
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthIncome = sponsors
        .filter(s => {
            const sDate = new Date(s.date);
            return s.status === 'Paid' && sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear;
        })
        .reduce((sum, s) => sum + s.amount, 0);

    document.getElementById('stat-urgent').innerText = urgentTasks.length;
    document.getElementById('stat-warning').innerText = warningTasks.length;
    document.getElementById('stat-in-progress').innerText = inProgressTasks.length;
    document.getElementById('stat-month-income').innerText = `$${currentMonthIncome.toLocaleString()}`;

    // Urgent Table Rendering
    const tbody = document.getElementById('urgent-tasks-tbody');
    tbody.innerHTML = '';

    if (urgentTasks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary); padding: 2rem;">មិនទាន់មានទិន្នន័យ Content ប្រញាប់នៅឡើយទេ! 🎉</td></tr>`;
    } else {
        urgentTasks.forEach(task => {
            const statusInfo = getDeadlineStatus(task.deadline);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${task.title}</strong></td>
                <td>${task.client}</td>
                <td><i class="fa-brands fa-${task.platform.toLowerCase()}"></i> ${task.platform}</td>
                <td><span class="badge badge-normal">${task.status}</span></td>
                <td><span class="badge ${statusInfo.class}">${statusInfo.label}</span></td>
                <td style="text-align: right;">
                    <button class="btn-icon" onclick="editTask('${task.id}')" title="កែប្រែ"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-icon" onclick="deleteTask('${task.id}')" title="លុប"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function renderKanban() {
    const statuses = ['Idea', 'Shooting', 'Editing', 'Review', 'Done'];
    const searchVal = searchInput.value.toLowerCase();
    const clientVal = filterClient.value;
    const platformVal = filterPlatform.value;

    statuses.forEach(status => {
        const listEl = document.getElementById(`list-${status}`);
        if (!listEl) return;
        listEl.innerHTML = '';

        const filtered = tasks.filter(t => {
            const matchesStatus = t.status === status;
            const matchesSearch = t.title.toLowerCase().includes(searchVal) || t.client.toLowerCase().includes(searchVal);
            const matchesClient = !clientVal || t.client === clientVal;
            const matchesPlatform = !platformVal || t.platform === platformVal;
            return matchesStatus && matchesSearch && matchesClient && matchesPlatform;
        });

        document.getElementById(`count-${status}`).innerText = filtered.length;

        filtered.forEach(task => {
            const statusInfo = getDeadlineStatus(task.deadline);
            let cardClass = 'task-card';
            if (task.status !== 'Done') {
                if (statusInfo.isUrgent) cardClass += ' is-urgent';
                else if (statusInfo.isWarning) cardClass += ' is-warning';
            }

            const card = document.createElement('div');
            card.className = cardClass;
            card.innerHTML = `
                <div class="task-card-header">
                    <span class="task-client">${task.client}</span>
                    <span class="badge ${task.status === 'Done' ? 'badge-normal' : statusInfo.class}">${task.status === 'Done' ? 'Completed' : statusInfo.label}</span>
                </div>
                <h4>${task.title}</h4>
                <div class="task-meta">
                    <span><i class="fa-brands fa-${task.platform.toLowerCase()}"></i> ${task.platform}</span>
                    <span><i class="fa-regular fa-calendar"></i> ${new Date(task.deadline).toLocaleString('km-KH')}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-icon" onclick="editTask('${task.id}')" title="កែប្រែ"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-icon" onclick="deleteTask('${task.id}')" title="លុប"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            listEl.appendChild(card);
        });
    });
}

function renderSponsors() {
    const tbody = document.getElementById('sponsors-tbody');
    tbody.innerHTML = '';

    if (sponsors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary); padding: 2rem;">មិនទាន់មានទិន្នន័យ Sponsor ឬចំណូលនៅឡើយទេ! សូមចុច "បន្ថែម Sponsor / ចំណូលថ្មី" ខាងលើ។</td></tr>`;
        return;
    }

    sponsors.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.brand}</strong></td>
            <td>${s.type}</td>
            <td style="color: var(--success); font-weight: 700;">$${s.amount.toLocaleString()}</td>
            <td>${s.date}</td>
            <td><span class="badge ${s.status === 'Paid' ? 'badge-paid' : 'badge-pending'}">${s.status}</span></td>
            <td style="text-align: right;">
                <button class="btn-icon" onclick="editSponsor('${s.id}')" title="កែប្រែ"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-icon" onclick="deleteSponsor('${s.id}')" title="លុប"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Search and Filter Event Listeners
searchInput.addEventListener('input', renderKanban);
filterClient.addEventListener('change', renderKanban);
filterPlatform.addEventListener('change', renderKanban);

// Initial App Launch
renderApp();