/* Freelancer Workspace - simplified productivity dashboard */

document.addEventListener('DOMContentLoaded', function () {
    // Highlight active sidebar link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar a').forEach(function (link) {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Search functionality for projects, tasks, and clients
    document.querySelectorAll('.search-input').forEach(function (searchInput) {
        const targetSelector = searchInput.dataset.target;
        if (!targetSelector) return;

        searchInput.addEventListener('input', function () {
            const query = searchInput.value.toLowerCase().trim();
            document.querySelectorAll(targetSelector).forEach(function (item) {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? '' : 'none';
            });
        });
    });

    // Filter buttons for projects and tasks
    document.querySelectorAll('.filter-buttons').forEach(function (group) {
        group.addEventListener('click', function (event) {
            const button = event.target.closest('button');
            if (!button) return;
            const filter = button.dataset.filter;
            const targetSelector = group.dataset.target;
            if (!filter || !targetSelector) return;

            group.querySelectorAll('button').forEach(function (btn) {
                btn.classList.toggle('active', btn === button);
            });

            document.querySelectorAll(targetSelector).forEach(function (item) {
                const status = (item.dataset.status || '').toLowerCase();
                const priority = (item.dataset.priority || '').toLowerCase();
                const due = (item.dataset.due || '').toLowerCase();
                const isCompleted = item.classList.contains('completed');
                const highValue = item.dataset.highValue === 'true';
                let visible = false;

                if (filter === 'all') {
                    visible = true;
                } else if (filter === 'high value') {
                    visible = highValue;
                } else if (filter === 'high priority') {
                    visible = priority === 'high';
                } else if (filter === 'due today') {
                    visible = due === 'due-today';
                } else if (filter === 'overdue') {
                    visible = due === 'overdue';
                } else if (filter === 'completed') {
                    visible = isCompleted || status.includes('completed');
                } else if (filter === 'pending') {
                    visible = !isCompleted && !status.includes('completed');
                } else {
                    visible = status.includes(filter);
                }

                item.style.display = visible ? '' : 'none';
            });
        });
    });

    // Task completion toggle with visual state
    document.querySelectorAll('.tasks-list').forEach(function (container) {
        container.addEventListener('change', function (event) {
            const checkbox = event.target.closest('input[type="checkbox"]');
            if (!checkbox) return;
            const taskCard = checkbox.closest('.task-card');
            if (!taskCard) return;
            taskCard.classList.toggle('completed', checkbox.checked);
        });
    });

    // Calendar date selection
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        calendarGrid.addEventListener('click', function (event) {
            const day = event.target.closest('.calendar-day:not(.muted)');
            if (!day) return;
            calendarGrid.querySelectorAll('.calendar-day').forEach(function (item) {
                item.classList.remove('selected-day');
            });
            day.classList.add('selected-day');
        });
    }

    // Save settings button
    document.querySelectorAll('.save-settings').forEach(function (button) {
        button.addEventListener('click', function () {
            alert('Your settings have been saved successfully.');
        });
    });

    /* ==========================================
       Projects App - CRUD, search, filter, sort
       Persists to localStorage
    ========================================== */

    (function initProjectsApp() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage !== 'projects.html') return;

        const STORAGE_KEY = 'fw_projects_v2';

        // Utilities
        function uid() {
            return 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }

        function loadProjects() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            } catch (e) {
                return [];
            }
        }

        function saveProjects(list) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }

        // DOM refs
        const projectListEl = document.querySelector('.project-list');
        const addBtn = document.getElementById('add-project-btn');
        const modal = document.getElementById('project-modal');
        const modalClose = document.getElementById('modal-close');
        const modalCancel = document.getElementById('modal-cancel');
        const form = document.getElementById('project-form');
        const modalTitle = document.getElementById('modal-title');
        const detailsModal = document.getElementById('details-modal');
        const detailsClose = document.getElementById('details-close');
        const detailsContent = document.getElementById('details-content');
        const sortSelect = document.getElementById('project-sort');

        let projects = loadProjects();

        // Create default sample projects if empty (non-invasive)
        if (projects.length === 0) {
            projects = [
                {
                    id: uid(),
                    name: 'Website Redesign',
                    client: 'Blue Ridge Co.',
                    category: 'Web Design',
                    budget: 2400,
                    paid: 1200,
                    startDate: '2026-07-01',
                    deadline: '2026-07-28',
                    status: 'In Progress',
                    priority: 'High',
                    description: 'Redesign homepage and update styles.',
                    notes: '',
                    progress: 72,
                    createdAt: Date.now()
                },
                {
                    id: uid(),
                    name: 'Marketing Landing Page',
                    client: 'Nova Studio',
                    category: 'Landing Page',
                    budget: 900,
                    paid: 200,
                    startDate: '2026-07-10',
                    deadline: '2026-08-04',
                    status: 'Pending',
                    priority: 'Medium',
                    description: 'Create conversion-focused landing page.',
                    notes: '',
                    progress: 35,
                    createdAt: Date.now() - 86400000
                },
                {
                    id: uid(),
                    name: 'SEO Optimization',
                    client: 'Stellar Ads',
                    category: 'SEO',
                    budget: 1200,
                    paid: 300,
                    startDate: '2026-06-20',
                    deadline: '2026-07-25',
                    status: 'In Progress',
                    priority: 'High',
                    description: 'On-page and technical SEO improvements.',
                    notes: '',
                    progress: 58,
                    createdAt: Date.now() - 172800000
                },
                {
                    id: uid(),
                    name: 'Dashboard UI',
                    client: 'Alpha Corp',
                    category: 'UI/UX',
                    budget: 1800,
                    paid: 600,
                    startDate: '2026-07-05',
                    deadline: '2026-08-15',
                    status: 'In Progress',
                    priority: 'Medium',
                    description: 'Design and prototype admin dashboard.',
                    notes: '',
                    progress: 28,
                    createdAt: Date.now() - 259200000
                },
                {
                    id: uid(),
                    name: 'E-commerce Store',
                    client: 'Green Basket',
                    category: 'E-commerce',
                    budget: 3200,
                    paid: 800,
                    startDate: '2026-06-01',
                    deadline: '2026-09-01',
                    status: 'Pending',
                    priority: 'High',
                    description: 'Full e-commerce development with payment integration.',
                    notes: '',
                    progress: 10,
                    createdAt: Date.now() - 345600000
                },
                {
                    id: uid(),
                    name: 'Content Management System',
                    client: 'Bright Desk',
                    category: 'UX/UI',
                    budget: 1500,
                    paid: 400,
                    startDate: '2026-07-12',
                    deadline: '2026-08-10',
                    status: 'In Progress',
                    priority: 'Low',
                    description: 'CMS admin panel and editor UX.',
                    notes: '',
                    progress: 50,
                    createdAt: Date.now() - 432000000
                },
                {
                    id: uid(),
                    name: 'Brand Identity System',
                    client: 'Luna Creative',
                    category: 'Branding',
                    budget: 1400,
                    paid: 500,
                    startDate: '2026-07-02',
                    deadline: '2026-07-29',
                    status: 'Pending',
                    priority: 'Medium',
                    description: 'Brand visuals, colour palette and icons.',
                    notes: '',
                    progress: 25,
                    createdAt: Date.now() - 518400000
                },
                {
                    id: uid(),
                    name: 'User Research Report',
                    client: 'Nova Studio',
                    category: 'Research',
                    budget: 950,
                    paid: 300,
                    startDate: '2026-07-08',
                    deadline: '2026-07-22',
                    status: 'Completed',
                    priority: 'Low',
                    description: 'Collect and summarize user feedback.',
                    notes: '',
                    progress: 100,
                    createdAt: Date.now() - 604800000
                },
                {
                    id: uid(),
                    name: 'Social Media Kit',
                    client: 'Pixel Pulse',
                    category: 'Marketing',
                    budget: 700,
                    paid: 200,
                    startDate: '2026-07-15',
                    deadline: '2026-07-30',
                    status: 'In Progress',
                    priority: 'High',
                    description: 'Create social templates and post visuals.',
                    notes: '',
                    progress: 40,
                    createdAt: Date.now() - 259200000
                },
                {
                    id: uid(),
                    name: 'Real Estate Showcase',
                    client: 'Harbor Homes',
                    category: 'Real Estate Website',
                    budget: 2100,
                    paid: 900,
                    startDate: '2026-07-10',
                    deadline: '2026-08-25',
                    status: 'In Progress',
                    priority: 'High',
                    description: 'Build a modern property showcase site with search filters.',
                    notes: '',
                    progress: 52,
                    createdAt: Date.now() - 150000000
                },
                {
                    id: uid(),
                    name: 'Restaurant Booking Site',
                    client: 'Ocean Dine',
                    category: 'Restaurant Website',
                    budget: 1600,
                    paid: 1000,
                    startDate: '2026-06-25',
                    deadline: '2026-08-05',
                    status: 'Completed',
                    priority: 'Medium',
                    description: 'Responsive restaurant site with reservation and menu pages.',
                    notes: '',
                    progress: 100,
                    createdAt: Date.now() - 180000000
                },
                {
                    id: uid(),
                    name: 'Gym Membership Portal',
                    client: 'Peak Fitness',
                    category: 'Gym Website',
                    budget: 1800,
                    paid: 400,
                    startDate: '2026-07-12',
                    deadline: '2026-08-20',
                    status: 'Revision',
                    priority: 'Medium',
                    description: 'Membership landing page and class schedules for a gym brand.',
                    notes: '',
                    progress: 65,
                    createdAt: Date.now() - 190000000
                },
                {
                    id: uid(),
                    name: 'Salon Appointment Site',
                    client: 'Glow Salon',
                    category: 'Salon Website',
                    budget: 1100,
                    paid: 350,
                    startDate: '2026-07-18',
                    deadline: '2026-08-08',
                    status: 'Pending',
                    priority: 'Low',
                    description: 'Stylish booking site for a beauty salon with service listings.',
                    notes: '',
                    progress: 20,
                    createdAt: Date.now() - 210000000
                },
                {
                    id: uid(),
                    name: 'Medical Clinic Website',
                    client: 'CarePoint Clinic',
                    category: 'Medical Website',
                    budget: 1250,
                    paid: 600,
                    startDate: '2026-06-30',
                    deadline: '2026-08-10',
                    status: 'In Progress',
                    priority: 'High',
                    description: 'Professional clinic website with appointment form and doctor profiles.',
                    notes: '',
                    progress: 45,
                    createdAt: Date.now() - 220000000
                },
                {
                    id: uid(),
                    name: 'Education Platform Landing',
                    client: 'BrightLearn',
                    category: 'Educational Website',
                    budget: 950,
                    paid: 150,
                    startDate: '2026-07-20',
                    deadline: '2026-08-15',
                    status: 'Pending',
                    priority: 'Medium',
                    description: 'Landing page for an online learning platform with course highlights.',
                    notes: '',
                    progress: 15,
                    createdAt: Date.now() - 230000000
                },
                {
                    id: uid(),
                    name: 'Travel Agency Microsite',
                    client: 'Wanderlust Travel',
                    category: 'Travel Website',
                    budget: 1350,
                    paid: 950,
                    startDate: '2026-07-05',
                    deadline: '2026-07-29',
                    status: 'Completed',
                    priority: 'Low',
                    description: 'Seasonal travel promotion site with destination galleries.',
                    notes: '',
                    progress: 100,
                    createdAt: Date.now() - 240000000
                },
                {
                    id: uid(),
                    name: 'NGO Donation Portal',
                    client: 'HopeBridge',
                    category: 'NGO Website',
                    budget: 1800,
                    paid: 850,
                    startDate: '2026-07-01',
                    deadline: '2026-08-18',
                    status: 'On Hold',
                    priority: 'Medium',
                    description: 'Fundraising portal and impact stories for a nonprofit.',
                    notes: '',
                    progress: 40,
                    createdAt: Date.now() - 250000000
                },
                {
                    id: uid(),
                    name: 'SaaS Landing Page',
                    client: 'CloudCore',
                    category: 'SaaS Website',
                    budget: 2200,
                    paid: 1200,
                    startDate: '2026-07-14',
                    deadline: '2026-08-27',
                    status: 'In Progress',
                    priority: 'High',
                    description: 'Conversion-driven landing page for a SaaS product launch.',
                    notes: '',
                    progress: 58,
                    createdAt: Date.now() - 260000000
                },
                {
                    id: uid(),
                    name: 'Portfolio Refresh',
                    client: 'Milo Carter',
                    category: 'Portfolio Website',
                    budget: 450,
                    paid: 250,
                    startDate: '2026-07-16',
                    deadline: '2026-07-31',
                    status: 'Revision',
                    priority: 'Low',
                    description: 'Modern portfolio update with case study pages and contact form.',
                    notes: '',
                    progress: 70,
                    createdAt: Date.now() - 270000000
                }
            ];
            saveProjects(projects);
        }

        // Render helpers
        function computeDeadlineBadge(deadline, status) {
            if (!deadline) return { label: '', cls: '' };
            if (status && status.toLowerCase() === 'completed') return { label: 'Completed', cls: 'status-completed' };
            const today = new Date();
            const d = new Date(deadline + 'T23:59:59');
            const diff = Math.ceil((d - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / (1000 * 60 * 60 * 24));
            if (diff < 0) return { label: 'Overdue', cls: 'status-overdue' };
            if (diff === 0) return { label: 'Due Today', cls: 'status-today' };
            if (diff === 1) return { label: 'Due Tomorrow', cls: 'status-tomorrow' };
            return { label: 'Upcoming', cls: 'status-upcoming' };
        }

        function formatCurrency(v) {
            if (v == null || isNaN(v)) return '$0';
            return '$' + Number(v).toLocaleString();
        }

        function render() {
            // sort if needed
            const sortBy = sortSelect ? sortSelect.value : 'deadline';
            let list = projects.slice();
            if (sortBy === 'deadline') {
                list.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
            } else if (sortBy === 'name') {
                list.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'newest') {
                list.sort((a, b) => b.createdAt - a.createdAt);
            } else if (sortBy === 'oldest') {
                list.sort((a, b) => a.createdAt - b.createdAt);
            }

            projectListEl.innerHTML = '';
            list.forEach(function (p) {
                const badge = computeDeadlineBadge(p.deadline, p.status);
                const remaining = (p.budget || 0) - (p.paid || 0);

                const article = document.createElement('article');
                article.className = 'project-card';
                article.dataset.status = (p.status || '').toLowerCase();
                article.dataset.id = p.id;

                article.innerHTML = `
                    <div>
                        <h3>${escapeHtml(p.name)}</h3>
                        <p>Client: ${escapeHtml(p.client || '')} · Category: ${escapeHtml(p.category || '')}</p>
                        <div class="project-details">
                            <span class="status-pill ${statusClassFromName(p.status)}">${escapeHtml(p.status || '')}</span>
                            <span class="badge ${badge.cls}">${badge.label}</span>
                            <span>Deadline: ${p.deadline || '—'}</span>
                        </div>
                        <div class="progress" aria-hidden="true">
                            <div class="progress-fill" style="width:${Number(p.progress || 0)}%;"></div>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">
                        <div style="display:flex;gap:8px;align-items:center;">
                            <small>${formatCurrency(p.budget)}</small>
                            <small>Paid: ${formatCurrency(p.paid || 0)}</small>
                            <small>Remaining: ${formatCurrency(remaining)}</small>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button class="secondary-btn view-details" data-id="${p.id}">View</button>
                            <button class="secondary-btn edit-project" data-id="${p.id}">Edit</button>
                            <button class="secondary-btn delete-project" data-id="${p.id}">Delete</button>
                        </div>
                        <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
                            <input type="range" min="0" max="100" value="${Number(p.progress || 0)}" class="progress-range" data-id="${p.id}" aria-label="Progress">
                            <input type="number" min="0" max="100" value="${Number(p.progress || 0)}" class="progress-number" data-id="${p.id}" style="width:64px;padding:6px;border-radius:8px;border:1px solid var(--border);">
                        </div>
                    </div>
                `;

                projectListEl.appendChild(article);
            });
        }

        function statusClassFromName(name) {
            if (!name) return '';
            const n = name.toLowerCase();
            if (n.includes('progress')) return 'in-progress';
            if (n.includes('complete')) return 'completed';
            if (n.includes('pending')) return 'pending';
            if (n.includes('hold')) return 'on-hold';
            return '';
        }

        function escapeHtml(s) {
            return String(s || '').replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[m]; });
        }

        // Events
        // open add modal
        addBtn.addEventListener('click', function () {
            openModal('add');
        });

        modalClose.addEventListener('click', closeModal);
        modalCancel.addEventListener('click', closeModal);

        detailsClose.addEventListener('click', function () { detailsModal.classList.remove('open'); detailsModal.setAttribute('aria-hidden', 'true'); });

        // form submit - add or update
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const fd = new FormData(form);
            const data = Object.fromEntries(fd.entries());
            // normalize numbers
            data.budget = data.budget ? Number(data.budget) : 0;
            data.paid = data.paid ? Number(data.paid) : 0;
            data.progress = data.progress ? Number(data.progress) : 0;

            if (!data.id) {
                // create
                const newProj = Object.assign({
                    id: uid(),
                    paid: 0,
                    notes: '',
                    progress: 0,
                    createdAt: Date.now()
                }, data);
                projects.push(newProj);
            } else {
                // update
                const idx = projects.findIndex(p => p.id === data.id);
                if (idx > -1) {
                    projects[idx] = Object.assign(projects[idx], data);
                }
            }
            saveProjects(projects);
            render();
            closeModal();
        });

        // Delegated actions: edit, delete, view, progress change
        projectListEl.addEventListener('click', function (e) {
            const editBtn = e.target.closest('.edit-project');
            const delBtn = e.target.closest('.delete-project');
            const viewBtn = e.target.closest('.view-details');
            if (editBtn) {
                const id = editBtn.dataset.id;
                openModal('edit', id);
            } else if (delBtn) {
                const id = delBtn.dataset.id;
                if (confirm('Delete this project? This action cannot be undone.')) {
                    projects = projects.filter(p => p.id !== id);
                    saveProjects(projects);
                    render();
                }
            } else if (viewBtn) {
                const id = viewBtn.dataset.id;
                openDetails(id);
            }
        });

        // progress inputs
        projectListEl.addEventListener('input', function (e) {
            const range = e.target.closest('.progress-range');
            const num = e.target.closest('.progress-number');
            if (range) {
                const id = range.dataset.id;
                const val = Number(range.value);
                const proj = projects.find(p => p.id === id);
                if (proj) {
                    proj.progress = val;
                    saveProjects(projects);
                    // sync number
                    const numberEl = projectListEl.querySelector('.progress-number[data-id="' + id + '"]');
                    if (numberEl) numberEl.value = val;
                    // update bar
                    const card = projectListEl.querySelector('.project-card[data-id="' + id + '"] .progress-fill');
                    if (card) card.style.width = val + '%';
                }
            } else if (num) {
                const id = num.dataset.id;
                let val = Number(num.value);
                if (isNaN(val)) val = 0;
                val = Math.max(0, Math.min(100, val));
                const proj = projects.find(p => p.id === id);
                if (proj) {
                    proj.progress = val;
                    saveProjects(projects);
                    const rangeEl = projectListEl.querySelector('.progress-range[data-id="' + id + '"]');
                    if (rangeEl) rangeEl.value = val;
                    const bar = projectListEl.querySelector('.project-card[data-id="' + id + '"] .progress-fill');
                    if (bar) bar.style.width = val + '%';
                }
            }
        });

        // search is handled globally by existing .search-input handler

        // filter buttons already handled, but ensure render is called on sort change
        if (sortSelect) sortSelect.addEventListener('change', render);

        // modal helpers
        function openModal(mode, id) {
            form.reset();
            form.querySelector('input[name="id"]').value = '';
            if (mode === 'add') {
                modalTitle.textContent = 'Add Project';
            } else if (mode === 'edit') {
                modalTitle.textContent = 'Edit Project';
                const proj = projects.find(p => p.id === id);
                if (proj) {
                    for (const key in proj) {
                        const el = form.elements[key];
                        if (!el) continue;
                        if (el.type === 'select-one' || el.type === 'text' || el.type === 'textarea' || el.type === 'date' || el.type === 'number') {
                            el.value = proj[key] ?? '';
                        }
                    }
                    form.elements['id'].value = proj.id;
                }
            }
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
        }

        function closeModal() {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        }

        function openDetails(id) {
            const p = projects.find(x => x.id === id);
            if (!p) return;
            const remaining = (p.budget || 0) - (p.paid || 0);
            detailsContent.innerHTML = `
                <h4>${escapeHtml(p.name)}</h4>
                <p><strong>Client:</strong> ${escapeHtml(p.client)}</p>
                <p><strong>Category:</strong> ${escapeHtml(p.category)}</p>
                <p><strong>Status:</strong> <span class="status-pill ${statusClassFromName(p.status)}">${escapeHtml(p.status)}</span></p>
                <p><strong>Priority:</strong> <span class="priority-pill ${p.priority.toLowerCase()}">${escapeHtml(p.priority)}</span></p>
                <p><strong>Budget:</strong> ${formatCurrency(p.budget)} · Paid: ${formatCurrency(p.paid || 0)} · Remaining: ${formatCurrency(remaining)}</p>
                <p><strong>Start:</strong> ${p.startDate || '—'} · <strong>Deadline:</strong> ${p.deadline || '—'}</p>
                <div style="margin-top:12px;"><strong>Description</strong><p>${escapeHtml(p.description)}</p></div>
                <div style="margin-top:12px;"><strong>Notes</strong><textarea data-id="${p.id}" class="notes-area" rows="4">${escapeHtml(p.notes || '')}</textarea>
                <div style="display:flex;justify-content:flex-end;margin-top:8px;"><button class="primary-btn save-notes" data-id="${p.id}">Save Notes</button></div></div>
            `;
            detailsModal.classList.add('open');
            detailsModal.setAttribute('aria-hidden', 'false');
        }

        // save notes
        detailsContent.addEventListener('click', function (e) {
            const btn = e.target.closest('.save-notes');
            if (!btn) return;
            const id = btn.dataset.id;
            const ta = detailsContent.querySelector('.notes-area[data-id="' + id + '"]');
            if (!ta) return;
            const proj = projects.find(p => p.id === id);
            if (proj) {
                proj.notes = ta.value;
                saveProjects(projects);
                alert('Notes saved');
            }
        });

        // initialize render
        render();
    })();

    /* ==========================================
       Tasks App - Freelancer task management
       Persists to localStorage
    ========================================== */
    (function initTasksApp() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage !== 'tasks.html') return;

        const STORAGE_KEY = 'fw_tasks_v1';
        const taskListEl = document.getElementById('tasks-list');
        const addTaskBtn = document.getElementById('add-task-btn');
        const taskModal = document.getElementById('task-modal');
        const taskModalClose = document.getElementById('task-modal-close');
        const taskModalCancel = document.getElementById('task-modal-cancel');
        const taskForm = document.getElementById('task-form');
        const totalTasksEl = document.getElementById('total-tasks');
        const completedTasksEl = document.getElementById('completed-tasks');
        const pendingTasksEl = document.getElementById('pending-tasks');

        function uid() {
            return 't-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }

        function loadTasks() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            } catch (e) {
                return [];
            }
        }

        function saveTasks(list) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }

        function formatDate(dateString) {
            if (!dateString) return '—';
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) return '—';
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        function escapeHtml(text) {
            return String(text || '').replace(/[&<>'"]/g, function (match) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
            });
        }

        function computeDeadlineTag(task) {
            if (!task.dueDate) return { label: 'No Date', cls: 'status-upcoming' };
            const today = new Date();
            const due = new Date(task.dueDate + 'T23:59:59');
            const diff = Math.ceil((due - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / (1000 * 60 * 60 * 24));
            if (task.status === 'Completed') return { label: 'Completed', cls: 'status-completed' };
            if (diff < 0) return { label: 'Overdue', cls: 'status-overdue' };
            if (diff === 0) return { label: 'Due Today', cls: 'status-today' };
            if (diff === 1) return { label: 'Due Tomorrow', cls: 'status-tomorrow' };
            return { label: 'Upcoming', cls: 'status-upcoming' };
        }

        function getPriorityClass(priority) {
            if (!priority) return 'low';
            const level = priority.toLowerCase();
            if (level === 'high') return 'high';
            if (level === 'medium') return 'medium';
            return 'low';
        }

        function updateSummary(tasks) {
            const total = tasks.length;
            const completed = tasks.filter(task => task.status === 'Completed').length;
            const pending = total - completed;
            if (totalTasksEl) totalTasksEl.textContent = total;
            if (completedTasksEl) completedTasksEl.textContent = completed;
            if (pendingTasksEl) pendingTasksEl.textContent = pending;
        }

        function openTaskModal(mode, id) {
            taskForm.reset();
            taskForm.elements['id'].value = '';
            if (mode === 'edit') {
                const task = tasks.find(item => item.id === id);
                if (task) {
                    taskForm.elements['id'].value = task.id;
                    taskForm.elements['name'].value = task.name;
                    taskForm.elements['project'].value = task.project;
                    taskForm.elements['priority'].value = task.priority;
                    taskForm.elements['dueDate'].value = task.dueDate;
                    taskForm.elements['status'].value = task.status;
                    taskForm.elements['description'].value = task.description;
                    document.getElementById('task-modal-title').textContent = 'Edit Task';
                }
            } else {
                document.getElementById('task-modal-title').textContent = 'Add Task';
            }
            taskModal.classList.add('open');
            taskModal.setAttribute('aria-hidden', 'false');
        }

        function closeTaskModal() {
            taskModal.classList.remove('open');
            taskModal.setAttribute('aria-hidden', 'true');
        }

        function renderTasks() {
            if (!taskListEl) return;
            taskListEl.innerHTML = '';
            if (!tasks.length) {
                taskListEl.innerHTML = '<div class="task-card"><p style="color:var(--text-light);">No tasks yet. Click Add Task to create your first task.</p></div>';
                updateSummary(tasks);
                return;
            }

            tasks.forEach(function (task) {
                const deadline = computeDeadlineTag(task);
                const priorityClass = getPriorityClass(task.priority);
                const completedClass = task.status === 'Completed' ? ' completed' : '';
                const article = document.createElement('article');
                article.className = 'task-card' + completedClass;
                article.dataset.status = task.status.toLowerCase();
                article.dataset.priority = priorityClass;
                article.dataset.due = deadline.label.toLowerCase().replace(/ /g, '-');

                article.innerHTML = `
                    <div style="display:flex;align-items:center;gap:16px;">
                        <input type="checkbox" data-id="${task.id}" ${task.status === 'Completed' ? 'checked' : ''}>
                        <div>
                            <h3>${escapeHtml(task.name)}</h3>
                            <p>Project: ${escapeHtml(task.project)}</p>
                        </div>
                    </div>
                    <div class="task-meta">
                        <span class="priority-pill ${priorityClass}">${escapeHtml(task.priority)}</span>
                        <span class="due-date ${deadline.cls}">${escapeHtml(deadline.label)}</span>
                        <span>${formatDate(task.dueDate)}</span>
                    </div>
                    <div class="task-actions">
                        <button type="button" class="secondary-btn edit-task" data-id="${task.id}">Edit</button>
                        <button type="button" class="secondary-btn delete-task" data-id="${task.id}">Delete</button>
                    </div>
                `;
                taskListEl.appendChild(article);
            });
            updateSummary(tasks);
        }

        let tasks = loadTasks();
        if (tasks.length === 0) {
            tasks = [
                {
                    id: uid(),
                    name: 'Review client feedback',
                    project: 'Website Redesign',
                    priority: 'High',
                    dueDate: '2026-07-22',
                    status: 'Pending',
                    description: 'Summarize feedback and prepare updates for the landing page.'
                },
                {
                    id: uid(),
                    name: 'Finalize homepage copy',
                    project: 'Marketing Landing Page',
                    priority: 'Medium',
                    dueDate: '2026-07-25',
                    status: 'Pending',
                    description: 'Update headline and call-to-action text before review.'
                },
                {
                    id: uid(),
                    name: 'Send proposal to client',
                    project: 'Content Management System',
                    priority: 'High',
                    dueDate: '2026-07-24',
                    status: 'Pending',
                    description: 'Draft estimate and timeline for CMS onboarding work.'
                },
                {
                    id: uid(),
                    name: 'Publish design handoff',
                    project: 'Mobile App UI',
                    priority: 'Low',
                    dueDate: '2026-07-20',
                    status: 'Completed',
                    description: 'Upload assets and share flow documentation with the client.'
                }
            ];
            saveTasks(tasks);
        }

        addTaskBtn.addEventListener('click', function () {
            openTaskModal('add');
        });

        taskModalClose.addEventListener('click', closeTaskModal);
        taskModalCancel.addEventListener('click', closeTaskModal);

        taskForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(taskForm);
            const values = Object.fromEntries(formData.entries());
            const isEdit = Boolean(values.id);
            const taskData = {
                id: values.id || uid(),
                name: values.name.trim(),
                project: values.project.trim(),
                priority: values.priority,
                dueDate: values.dueDate,
                status: values.status,
                description: values.description.trim()
            };

            if (isEdit) {
                const index = tasks.findIndex(item => item.id === values.id);
                if (index > -1) {
                    tasks[index] = Object.assign(tasks[index], taskData);
                }
            } else {
                tasks.unshift(taskData);
            }

            saveTasks(tasks);
            renderTasks();
            closeTaskModal();
        });

        taskListEl.addEventListener('click', function (event) {
            const editBtn = event.target.closest('.edit-task');
            const deleteBtn = event.target.closest('.delete-task');
            if (editBtn) {
                openTaskModal('edit', editBtn.dataset.id);
                return;
            }
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (confirm('Delete this task? This action cannot be undone.')) {
                    tasks = tasks.filter(item => item.id !== id);
                    saveTasks(tasks);
                    renderTasks();
                }
            }
        });

        taskListEl.addEventListener('change', function (event) {
            const checkbox = event.target.closest('input[type="checkbox"]');
            if (!checkbox) return;
            const id = checkbox.dataset.id;
            const task = tasks.find(item => item.id === id);
            if (!task) return;
            task.status = checkbox.checked ? 'Completed' : 'Pending';
            saveTasks(tasks);
            renderTasks();
        });

        renderTasks();
    })();

    /* ==========================================
       Clients App - Freelance client management
       Persists to localStorage
    ========================================== */
    (function initClientsApp() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage !== 'clients.html') return;

        const STORAGE_KEY = 'fw_clients_v1';
        const clientsGrid = document.getElementById('clients-grid');
        const addClientBtn = document.getElementById('add-client-btn');
        const clientModal = document.getElementById('client-modal');
        const clientModalClose = document.getElementById('client-modal-close');
        const clientModalCancel = document.getElementById('client-modal-cancel');
        const clientForm = document.getElementById('client-form');
        const detailsModal = document.getElementById('client-details-modal');
        const detailsClose = document.getElementById('client-details-close');
        const detailsContent = document.getElementById('client-details-content');
        const totalClientsEl = document.getElementById('total-clients');
        const activeClientsEl = document.getElementById('active-clients');
        const highValueClientsEl = document.getElementById('high-value-clients');

        function uid() {
            return 'c-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }

        function loadClients() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            } catch (e) {
                return [];
            }
        }

        function saveClients(list) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }

        function formatCurrency(value) {
            if (value == null || isNaN(value)) {
                return '$0';
            }
            return '$' + Number(value).toLocaleString();
        }

        function statusClass(status) {
            if (!status) return '';
            const normalized = status.toLowerCase();
            if (normalized.includes('active')) return 'in-progress';
            if (normalized.includes('inactive')) return 'completed';
            if (normalized.includes('waiting')) return 'pending';
            if (normalized.includes('completed')) return 'completed';
            return 'pending';
        }

        function updateSummaryCards(clients) {
            const total = clients.length;
            const active = clients.filter(c => c.status === 'Active').length;
            const highValue = clients.filter(c => c.highValue).length;
            if (totalClientsEl) totalClientsEl.textContent = total;
            if (activeClientsEl) activeClientsEl.textContent = active;
            if (highValueClientsEl) highValueClientsEl.textContent = highValue;
        }

        function openClientModal(mode, id) {
            clientForm.reset();
            clientForm.elements['id'].value = '';
            if (mode === 'edit') {
                const client = clients.find(c => c.id === id);
                if (client) {
                    clientForm.elements['id'].value = client.id;
                    clientForm.elements['name'].value = client.name;
                    clientForm.elements['company'].value = client.company;
                    clientForm.elements['email'].value = client.email;
                    clientForm.elements['phone'].value = client.phone;
                    clientForm.elements['country'].value = client.country;
                    clientForm.elements['status'].value = client.status;
                    clientForm.elements['notes'].value = client.notes;
                }
                document.getElementById('client-modal-title').textContent = 'Edit Client';
            } else {
                document.getElementById('client-modal-title').textContent = 'Add Client';
            }
            clientModal.classList.add('open');
            clientModal.setAttribute('aria-hidden', 'false');
        }

        function closeClientModal() {
            clientModal.classList.remove('open');
            clientModal.setAttribute('aria-hidden', 'true');
        }

        function openClientDetails(id) {
            const client = clients.find(c => c.id === id);
            if (!client) return;
            detailsContent.innerHTML = `
                <div style="display:grid;gap:18px;">
                    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
                        <img src="${client.avatar}" alt="${escapeHtml(client.name)}" style="width:80px;height:80px;border-radius:18px;object-fit:cover;">
                        <div>
                            <h3>${escapeHtml(client.name)}</h3>
                            <p>${escapeHtml(client.company)}</p>
                            <span class="status-pill ${statusClass(client.status)}">${escapeHtml(client.status)}</span>
                            <span class="rating">${escapeHtml(client.rating.toFixed(1))}</span>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;">
                        <div style="background:#F8FAFC;border-radius:18px;padding:16px;">
                            <h4>Projects</h4>
                            <p>Active: ${client.activeProjects}</p>
                            <p>Completed: ${client.completedProjects}</p>
                            <p>Total: ${client.totalProjects}</p>
                        </div>
                        <div style="background:#F8FAFC;border-radius:18px;padding:16px;">
                            <h4>Payments</h4>
                            <p>Total Earnings: ${formatCurrency(client.totalEarnings)}</p>
                            <p>Pending: ${formatCurrency(client.pendingPayment)}</p>
                            <p>Completed: ${formatCurrency(client.completedPayments)}</p>
                        </div>
                    </div>
                    <div style="background:#F8FAFC;border-radius:18px;padding:16px;">
                        <h4>Contact</h4>
                        <p><strong>Email:</strong> ${escapeHtml(client.email)}</p>
                        <p><strong>Phone:</strong> ${escapeHtml(client.phone)}</p>
                        <p><strong>Country:</strong> ${escapeHtml(client.country)}</p>
                    </div>
                    <div style="background:#F8FAFC;border-radius:18px;padding:16px;">
                        <h4>Notes</h4>
                        <p style="white-space:pre-wrap;">${escapeHtml(client.notes || 'No notes added yet.')}</p>
                    </div>
                </div>
            `;
            detailsModal.classList.add('open');
            detailsModal.setAttribute('aria-hidden', 'false');
        }

        function escapeHtml(s) {
            return String(s || '').replace(/[&<>'"]/g, function (m) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
            });
        }

        function renderClients() {
            if (!clientsGrid) return;
            clientsGrid.innerHTML = '';
            if (clients.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'client-card';
                empty.innerHTML = '<p style="color:var(--text-light);">No clients found yet. Click Add Client to start building your client list.</p>';
                clientsGrid.appendChild(empty);
                updateSummaryCards(clients);
                return;
            }

            clients.forEach(function (client) {
                const article = document.createElement('article');
                article.className = 'client-card';
                article.dataset.status = (client.status || '').toLowerCase();
                article.dataset.highValue = client.highValue ? 'true' : 'false';

                article.innerHTML = `
                    <img src="${client.avatar}" alt="${escapeHtml(client.name)}">
                    <div class="client-card-body">
                        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                            <div>
                                <h3>${escapeHtml(client.name)}</h3>
                                <p>${escapeHtml(client.company)}</p>
                                <div class="client-details">
                                    <span>${escapeHtml(client.email)}</span>
                                    <span>${escapeHtml(client.phone)}</span>
                                    <span>${escapeHtml(client.country)}</span>
                                </div>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-end;">
                                <span class="status-pill ${statusClass(client.status)}">${escapeHtml(client.status)}</span>
                                <span class="rating">${escapeHtml(client.rating.toFixed(1))}</span>
                            </div>
                        </div>
                        <div class="client-summary">
                            <div class="client-stat"><strong>${client.activeProjects}</strong><small>Active</small></div>
                            <div class="client-stat"><strong>${client.completedProjects}</strong><small>Completed</small></div>
                            <div class="client-stat"><strong>${client.totalProjects}</strong><small>Total Projects</small></div>
                        </div>
                        <div class="client-summary">
                            <div class="client-stat"><strong>${formatCurrency(client.totalEarnings)}</strong><small>Total Earnings</small></div>
                            <div class="client-stat"><strong>${formatCurrency(client.pendingPayment)}</strong><small>Pending Payment</small></div>
                            <div class="client-stat"><strong>${formatCurrency(client.completedPayments)}</strong><small>Completed Payments</small></div>
                        </div>
                        <div class="client-note-preview">
                            <strong>Notes</strong>
                            <p>${escapeHtml(client.notes || 'No notes saved yet.')}</p>
                        </div>
                    </div>
                    <div class="client-actions">
                        <button type="button" class="secondary-btn view-client" data-id="${client.id}">View Details</button>
                        <button type="button" class="secondary-btn edit-client" data-id="${client.id}">Edit</button>
                        <button type="button" class="secondary-btn delete-client" data-id="${client.id}">Delete</button>
                    </div>
                `;

                clientsGrid.appendChild(article);
            });
            updateSummaryCards(clients);
        }

        let clients = loadClients();
        if (clients.length === 0) {
            clients = [
                {
                    id: uid(),
                    avatar: 'https://i.pravatar.cc/100?img=47',
                    name: 'Arwa Mahmood',
                    company: 'Blue Ridge Co.',
                    email: 'arwa@blueridge.co',
                    phone: '+92 300 123 4567',
                    country: 'Pakistan',
                    status: 'Active',
                    rating: 4.9,
                    activeProjects: 2,
                    completedProjects: 5,
                    totalProjects: 7,
                    totalEarnings: 5600,
                    pendingPayment: 800,
                    completedPayments: 4800,
                    notes: 'Prefers email updates. Likes clean templates and weekly check-ins.',
                    highValue: true,
                    createdAt: Date.now()
                },
                {
                    id: uid(),
                    avatar: 'https://i.pravatar.cc/100?img=32',
                    name: 'Mina Malik',
                    company: 'Nova Studio',
                    email: 'mina@novastudio.com',
                    phone: '+92 321 765 4321',
                    country: 'United Kingdom',
                    status: 'Waiting for Feedback',
                    rating: 4.7,
                    activeProjects: 1,
                    completedProjects: 2,
                    totalProjects: 3,
                    totalEarnings: 3200,
                    pendingPayment: 1200,
                    completedPayments: 2000,
                    notes: 'Waiting on content approval. Send summaries every Thursday.',
                    highValue: true,
                    createdAt: Date.now() - 86400000
                },
                {
                    id: uid(),
                    avatar: 'https://i.pravatar.cc/100?img=12',
                    name: 'Omar Shah',
                    company: 'Vega Labs',
                    email: 'omar@vegalabs.io',
                    phone: '+92 333 888 9999',
                    country: 'United States',
                    status: 'Completed',
                    rating: 4.8,
                    activeProjects: 0,
                    completedProjects: 4,
                    totalProjects: 4,
                    totalEarnings: 4300,
                    pendingPayment: 0,
                    completedPayments: 4300,
                    notes: 'Project completed. Open to a maintenance retainer.',
                    highValue: false,
                    createdAt: Date.now() - 172800000
                },
                {
                    id: uid(),
                    avatar: 'https://i.pravatar.cc/100?img=68',
                    name: 'Sara Ahmed',
                    company: 'Bright Desk',
                    email: 'sara@brightdesk.net',
                    phone: '+92 345 111 2222',
                    country: 'Canada',
                    status: 'Active',
                    rating: 4.9,
                    activeProjects: 3,
                    completedProjects: 1,
                    totalProjects: 4,
                    totalEarnings: 7500,
                    pendingPayment: 1500,
                    completedPayments: 6000,
                    notes: 'Prefers video calls on Mondays. Uses green branding assets.',
                    highValue: true,
                    createdAt: Date.now() - 259200000
                },
                {
                    id: uid(),
                    avatar: 'https://i.pravatar.cc/100?img=26',
                    name: 'Nadia Khan',
                    company: 'Glow Salon',
                    email: 'nadia@glowsalon.com',
                    phone: '+92 312 444 5566',
                    country: 'Australia',
                    status: 'Inactive',
                    rating: 4.6,
                    activeProjects: 0,
                    completedProjects: 2,
                    totalProjects: 2,
                    totalEarnings: 1700,
                    pendingPayment: 0,
                    completedPayments: 1700,
                    notes: 'Clients wants occasional marketing support only. Follow up next quarter.',
                    highValue: false,
                    createdAt: Date.now() - 345600000
                }
            ];
            saveClients(clients);
        }

        addClientBtn.addEventListener('click', function () {
            openClientModal('add');
        });

        clientModalClose.addEventListener('click', closeClientModal);
        clientModalCancel.addEventListener('click', closeClientModal);
        detailsClose.addEventListener('click', function () {
            detailsModal.classList.remove('open');
            detailsModal.setAttribute('aria-hidden', 'true');
        });

        clientForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(clientForm);
            const data = Object.fromEntries(formData.entries());
            const existingId = data.id;
            const clientData = {
                name: data.name.trim(),
                company: data.company.trim(),
                email: data.email.trim(),
                phone: data.phone.trim(),
                country: data.country.trim(),
                status: data.status,
                notes: data.notes.trim(),
                avatar: 'https://i.pravatar.cc/100?img=' + (Math.floor(Math.random() * 70) + 10),
                rating: 4.5,
                activeProjects: 0,
                completedProjects: 0,
                totalProjects: 0,
                totalEarnings: 0,
                pendingPayment: 0,
                completedPayments: 0,
                highValue: false,
                createdAt: Date.now()
            };

            if (existingId) {
                const index = clients.findIndex(c => c.id === existingId);
                if (index > -1) {
                    const current = clients[index];
                    clients[index] = Object.assign(current, {
                        name: clientData.name,
                        company: clientData.company,
                        email: clientData.email,
                        phone: clientData.phone,
                        country: clientData.country,
                        status: clientData.status,
                        notes: clientData.notes
                    });
                }
            } else {
                clientData.id = uid();
                clients.unshift(clientData);
            }
            saveClients(clients);
            renderClients();
            closeClientModal();
        });

        clientsGrid.addEventListener('click', function (e) {
            const editBtn = e.target.closest('.edit-client');
            const deleteBtn = e.target.closest('.delete-client');
            const viewBtn = e.target.closest('.view-client');
            if (editBtn) {
                openClientModal('edit', editBtn.dataset.id);
            } else if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (confirm('Delete this client? This action cannot be undone.')) {
                    clients = clients.filter(c => c.id !== id);
                    saveClients(clients);
                    renderClients();
                }
            } else if (viewBtn) {
                openClientDetails(viewBtn.dataset.id);
            }
        });

        renderClients();
    })();

    // Calendar App Module
    (function initCalendarApp() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage !== 'calendar.html') return;

        const STORAGE_KEY = 'fw_events_v1';
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYearEl = document.getElementById('month-year');
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        const addEventBtn = document.getElementById('add-event-btn');
        const eventModal = document.getElementById('event-modal');
        const eventModalClose = document.getElementById('event-modal-close');
        const eventModalCancel = document.getElementById('event-modal-cancel');
        const eventForm = document.getElementById('event-form');
        const dateEventsEl = document.getElementById('date-events');
        const upcomingEventsEl = document.getElementById('upcoming-events');
        const eventsListEl = document.getElementById('events-list');
        const eventSearchInput = document.querySelector('.event-search-input');
        const totalEventsEl = document.getElementById('total-events');
        const dueTodayEl = document.getElementById('due-today');
        const overdueEl = document.getElementById('overdue');
        const completedEventsEl = document.getElementById('completed-events');
        const selectedDateTitleEl = document.getElementById('selected-date-title');

        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        let selectedDate = null;

        function uid() {
            return 'e-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        }

        function escapeHtml(text) {
            return String(text || '').replace(/[&<>'"]/g, function (match) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
            });
        }

        function loadEvents() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            } catch (e) {
                return [];
            }
        }

        function saveEvents(list) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }

        function formatDate(dateString) {
            if (!dateString) return '—';
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) return '—';
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        function formatTime(timeString) {
            if (!timeString) return '';
            const [hour, minute] = timeString.split(':');
            const h = parseInt(hour);
            const m = parseInt(minute);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            return displayHour.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0') + ' ' + ampm;
        }

        function getEventStatusBadge(eventDate) {
            if (!eventDate) return { label: 'No Date', cls: 'upcoming' };
            const today = new Date();
            const eventDay = new Date(eventDate + 'T23:59:59');
            const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const diff = Math.ceil((eventDay - todayDay) / (1000 * 60 * 60 * 24));
            if (diff < 0) return { label: 'Overdue', cls: 'overdue' };
            if (diff === 0) return { label: 'Today', cls: 'today' };
            if (diff === 1) return { label: 'Tomorrow', cls: 'tomorrow' };
            return { label: 'Upcoming', cls: 'upcoming' };
        }

        function updateSummaryCards(events) {
            const today = new Date().toISOString().split('T')[0];
            const total = events.length;
            const todayCount = events.filter(e => e.date === today).length;
            const overdueCount = events.filter(e => {
                const eventDay = new Date(e.date + 'T23:59:59');
                const todayDay = new Date();
                return e.date && eventDay < todayDay && e.type === 'Deadline';
            }).length;
            const completedCount = events.filter(e => e.completed === true).length;

            if (totalEventsEl) totalEventsEl.textContent = total;
            if (dueTodayEl) dueTodayEl.textContent = todayCount;
            if (overdueEl) overdueEl.textContent = overdueCount;
            if (completedEventsEl) completedEventsEl.textContent = completedCount;
        }

        function renderCalendar() {
            if (!calendarGrid) return;
            calendarGrid.innerHTML = '';

            // Month/Year header
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            if (monthYearEl) {
                monthYearEl.textContent = monthNames[currentMonth] + ' ' + currentYear;
            }

            // Day names
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayNames.forEach(function (name) {
                const span = document.createElement('span');
                span.textContent = name;
                span.style.fontWeight = '600';
                span.style.color = 'var(--text-light)';
                calendarGrid.appendChild(span);
            });

            // Get first day of month
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

            // Previous month's days
            for (let i = firstDay - 1; i >= 0; i--) {
                const span = document.createElement('span');
                span.textContent = daysInPrevMonth - i;
                span.className = 'muted';
                calendarGrid.appendChild(span);
            }

            // Current month's days
            const today = new Date();
            const events = loadEvents();
            for (let day = 1; day <= daysInMonth; day++) {
                const dayStr = day.toString().padStart(2, '0');
                const monthStr = (currentMonth + 1).toString().padStart(2, '0');
                const dateStr = currentYear + '-' + monthStr + '-' + dayStr;
                const hasEvents = events.some(e => e.date === dateStr);

                const span = document.createElement('span');
                span.className = 'calendar-day';
                span.textContent = day;
                if (hasEvents) span.classList.add('has-events');

                if (today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
                    span.classList.add('today');
                    if (!selectedDate) {
                        span.classList.add('selected-day');
                        selectedDate = dateStr;
                    }
                }

                span.addEventListener('click', function () {
                    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected-day'));
                    span.classList.add('selected-day');
                    selectedDate = dateStr;
                    renderDateEvents(dateStr);
                });

                calendarGrid.appendChild(span);
            }

            // Next month's days
            const totalCells = calendarGrid.children.length - 7; // Subtract day headers
            const remainingCells = 42 - totalCells;
            for (let i = 1; i <= remainingCells; i++) {
                const span = document.createElement('span');
                span.textContent = i;
                span.className = 'muted';
                calendarGrid.appendChild(span);
            }
        }

        function renderDateEvents(dateStr) {
            if (!dateEventsEl) return;
            const events = loadEvents().filter(e => e.date === dateStr);
            const dateObj = new Date(dateStr + 'T00:00:00');
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            if (selectedDateTitleEl) {
                selectedDateTitleEl.textContent = dateObj.toLocaleDateString('en-US', options);
            }

            dateEventsEl.innerHTML = '';
            if (!events.length) {
                dateEventsEl.innerHTML = '<p style="color:var(--text-light);">No events scheduled for this date.</p>';
                return;
            }

            events.forEach(function (event) {
                const div = document.createElement('div');
                div.className = 'dateEventCard';
                div.innerHTML = `
                    <h4>${escapeHtml(event.title)}</h4>
                    <p><strong>${escapeHtml(event.type)}</strong> ${event.time ? '· ' + formatTime(event.time) : ''}</p>
                    ${event.project ? '<p>Project: ' + escapeHtml(event.project) + '</p>' : ''}
                `;
                dateEventsEl.appendChild(div);
            });
        }

        function renderUpcomingEvents() {
            if (!upcomingEventsEl) return;
            const events = loadEvents();
            const now = new Date();
            const upcomingEvents = events
                .filter(e => e.date && new Date(e.date + 'T00:00:00') >= now)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5);

            upcomingEventsEl.innerHTML = '';
            if (!upcomingEvents.length) {
                upcomingEventsEl.innerHTML = '<p style="color:var(--text-light);">No upcoming events.</p>';
                return;
            }

            upcomingEvents.forEach(function (event) {
                const div = document.createElement('div');
                const typeClass = event.type.toLowerCase();
                div.className = 'upcomingEventCard ' + typeClass;
                div.innerHTML = `
                    <h4>${escapeHtml(event.title)}</h4>
                    <p class="event-time">${formatDate(event.date)} ${event.time ? '· ' + formatTime(event.time) : ''}</p>
                `;
                upcomingEventsEl.appendChild(div);
            });
        }

        function renderEventsList() {
            if (!eventsListEl) return;
            const events = loadEvents();
            const searchQuery = eventSearchInput ? eventSearchInput.value.toLowerCase().trim() : '';
            const activeFilter = document.querySelector('.filter-buttons[data-target=".event-item-card"] .active');
            const filterType = activeFilter ? activeFilter.dataset.filter.toLowerCase() : 'all';

            let filteredEvents = events;
            if (searchQuery) {
                filteredEvents = filteredEvents.filter(e =>
                    e.title.toLowerCase().includes(searchQuery) ||
                    (e.project && e.project.toLowerCase().includes(searchQuery))
                );
            }

            if (filterType !== 'all') {
                filteredEvents = filteredEvents.filter(e => e.type.toLowerCase() === filterType);
            }

            eventsListEl.innerHTML = '';
            if (!filteredEvents.length) {
                eventsListEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-light);">No events found.</div>';
                return;
            }

            filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(function (event) {
                const badge = getEventStatusBadge(event.date);
                const typeClass = event.type.toLowerCase();
                const article = document.createElement('article');
                article.className = 'event-item-card ' + typeClass;
                article.dataset.filter = typeClass;
                article.innerHTML = `
                    <div>
                        <h4>${escapeHtml(event.title)}</h4>
                        <p>${event.project ? 'Project: ' + escapeHtml(event.project) + ' · ' : ''}${formatDate(event.date)}${event.time ? ' · ' + formatTime(event.time) : ''}</p>
                    </div>
                    <span class="event-type-badge ${typeClass}">${escapeHtml(event.type)}</span>
                    <span class="event-status-badge ${badge.cls}">${escapeHtml(badge.label)}</span>
                    <div class="event-actions">
                        <button type="button" class="edit-event" data-id="${event.id}" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button type="button" class="delete-event" data-id="${event.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                eventsListEl.appendChild(article);
            });
        }

        function openEventModal(mode, id) {
            eventForm.reset();
            eventForm.elements['id'].value = '';
            if (mode === 'edit' && id) {
                const events = loadEvents();
                const event = events.find(e => e.id === id);
                if (event) {
                    eventForm.elements['id'].value = event.id;
                    eventForm.elements['title'].value = event.title;
                    eventForm.elements['type'].value = event.type;
                    eventForm.elements['date'].value = event.date;
                    eventForm.elements['time'].value = event.time || '';
                    eventForm.elements['project'].value = event.project || '';
                    eventForm.elements['description'].value = event.description || '';
                    document.getElementById('event-modal-title').textContent = 'Edit Event';
                }
            } else {
                document.getElementById('event-modal-title').textContent = 'Add Event';
                if (selectedDate) {
                    eventForm.elements['date'].value = selectedDate;
                }
            }
            eventModal.classList.add('open');
            eventModal.setAttribute('aria-hidden', 'false');
        }

        function closeEventModal() {
            eventModal.classList.remove('open');
            eventModal.setAttribute('aria-hidden', 'true');
        }

        function renderAll() {
            renderCalendar();
            renderUpcomingEvents();
            renderEventsList();
            if (selectedDate) renderDateEvents(selectedDate);
        }

        let events = loadEvents();
        if (events.length === 0) {
            events = [
                {
                    id: uid(),
                    title: 'Client Kickoff Meeting',
                    type: 'Meeting',
                    date: '2026-07-22',
                    time: '10:00',
                    project: 'Website Redesign',
                    description: 'Initial discussion with Blue Ridge Co. team.',
                    completed: false
                },
                {
                    id: uid(),
                    title: 'Design Review Session',
                    type: 'Meeting',
                    date: '2026-07-25',
                    time: '14:00',
                    project: 'Marketing Landing Page',
                    description: 'Review design mockups with Nova Studio.',
                    completed: false
                },
                {
                    id: uid(),
                    title: 'Project Deadline: Website Redesign',
                    type: 'Deadline',
                    date: '2026-07-28',
                    time: '18:00',
                    project: 'Website Redesign',
                    description: 'Final delivery date for Blue Ridge Co. website.',
                    completed: false
                },
                {
                    id: uid(),
                    title: 'Invoice Payment Due',
                    type: 'Payment',
                    date: '2026-07-30',
                    time: '',
                    project: 'Mobile App UI',
                    description: 'Payment due from Vega Labs for completed dashboard.',
                    completed: false
                }
            ];
            saveEvents(events);
        }

        addEventBtn.addEventListener('click', function () {
            openEventModal('add');
        });

        eventModalClose.addEventListener('click', closeEventModal);
        eventModalCancel.addEventListener('click', closeEventModal);

        eventForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(eventForm);
            const data = Object.fromEntries(formData.entries());
            const existingId = data.id;
            const eventData = {
                title: data.title.trim(),
                type: data.type,
                date: data.date,
                time: data.time || '',
                project: data.project.trim(),
                description: data.description.trim(),
                completed: false
            };

            events = loadEvents();
            if (existingId) {
                const index = events.findIndex(e => e.id === existingId);
                if (index > -1) {
                    events[index] = Object.assign(events[index], eventData);
                }
            } else {
                eventData.id = uid();
                events.unshift(eventData);
            }
            saveEvents(events);
            renderAll();
            closeEventModal();
            updateSummaryCards(events);
        });

        eventsListEl.addEventListener('click', function (e) {
            const editBtn = e.target.closest('.edit-event');
            const deleteBtn = e.target.closest('.delete-event');
            if (editBtn) {
                openEventModal('edit', editBtn.dataset.id);
            } else if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (confirm('Delete this event?')) {
                    events = loadEvents().filter(e => e.id !== id);
                    saveEvents(events);
                    renderAll();
                    updateSummaryCards(events);
                }
            }
        });

        if (eventSearchInput) {
            eventSearchInput.addEventListener('input', renderEventsList);
        }

        renderAll();
        updateSummaryCards(events);
    })();
});


document.addEventListener('DOMContentLoaded', function () {
    // Settings page: load saved preferences and attach page controls.
    const profileForm = document.querySelector('#profile-form');
    const passwordForm = document.querySelector('#password-form');
    const notificationCheckboxes = document.querySelectorAll('.notification-list input[type="checkbox"]');
    const themeCards = document.querySelectorAll('.theme-card');
    const photoInput = document.querySelector('#profile-photo');
    const photoPreview = document.querySelector('#profile-preview');

    function updateHeaderProfile(profile) {
        const name = document.querySelector('.header .profile h4');
        const title = document.querySelector('.header .profile small');
        if (name && profile.fullName) name.textContent = profile.fullName;
        if (title && profile.jobTitle) title.textContent = profile.jobTitle;
    }



    let savedProfile = null;
    try {
        savedProfile = JSON.parse(localStorage.getItem('profileData'));
        if (savedProfile) updateHeaderProfile(savedProfile);
    } catch (error) {
        localStorage.removeItem('profileData');
    }

    if (profileForm) {
        if (savedProfile) {
            Object.entries(savedProfile).forEach(function ([name, value]) {
                const field = profileForm.elements.namedItem(name);
                if (field) field.value = value || '';
            });
        }

        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const profileData = Object.fromEntries(new FormData(profileForm).entries());
            localStorage.setItem('profileData', JSON.stringify(profileData));
            updateHeaderProfile(profileData);
            showSuccessMessage('Profile updated successfully!');
        });
    }

    // The selected photo is displayed locally only; it is not uploaded or saved.
    if (photoInput && photoPreview) {
        photoInput.addEventListener('change', function () {
            const [photo] = photoInput.files;
            if (!photo) return;
            photoPreview.src = URL.createObjectURL(photo);
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(passwordForm);
            const currentPassword = formData.get('currentPassword').trim();
            const newPassword = formData.get('newPassword').trim();
            const confirmPassword = formData.get('confirmPassword').trim();

            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all password fields.');
            } else if (newPassword.length < 6) {
                alert('New password must be at least 6 characters.');
            } else if (newPassword !== confirmPassword) {
                alert('Passwords do not match.');
            } else {
                passwordForm.reset();
                showSuccessMessage('Password updated successfully!');
            }
        });
    }

    try {
        const savedNotifications = JSON.parse(localStorage.getItem('notificationSettings'));
        if (savedNotifications && typeof savedNotifications === 'object') {
            notificationCheckboxes.forEach(function (checkbox) {
                if (typeof savedNotifications[checkbox.name] === 'boolean') {
                    checkbox.checked = savedNotifications[checkbox.name];
                }
            });
        }
    } catch (error) {
        localStorage.removeItem('notificationSettings');
    }

    notificationCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            const settings = Object.fromEntries(Array.from(notificationCheckboxes, function (item) {
                return [item.name, item.checked];
            }));
            localStorage.setItem('notificationSettings', JSON.stringify(settings));
            showSuccessMessage('Notification preferences saved!');
        });
    });
});


const searchInput = document.getElementById("settings-search");

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const value = this.value.toLowerCase();

        const cards = document.querySelectorAll(".settings-card");

        cards.forEach(card => {

            const text = card.textContent.toLowerCase();

            if (text.includes(value)) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

}


const themeButtons = document.querySelectorAll(".theme-card");

themeButtons.forEach(button => {

    button.addEventListener("click", () => {

        themeButtons.forEach(btn =>
            btn.classList.remove("active-theme")
        );

        button.classList.add("active-theme");

        const theme = button.dataset.theme;

        document.body.classList.toggle(
            "dark-theme",
            theme === "dark"
        );

        localStorage.setItem("theme", theme);

    });

});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark-theme");

    document.querySelector('[data-theme="dark"]')
        ?.classList.add("active-theme");

    document.querySelector('[data-theme="light"]')
        ?.classList.remove("active-theme");

}


function showSuccessMessage(message) {

    const oldMessage = document.querySelector(".success-message");

    if (oldMessage) {

        oldMessage.remove();

    }

    const success = document.createElement("div");

    success.className = "success-message";

    success.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        ${message}
    `;

    document.body.appendChild(success);

    setTimeout(() => {

        success.classList.add("show");

    }, 100);

    setTimeout(() => {

        success.classList.remove("show");

        setTimeout(() => {

            success.remove();

        }, 300);

    }, 2500);

}


