/**
 * My Tasks - Ultimate Todo Application
 * 기능: 할 일 추가/삭제/수정, 카테고리, 검색, 정렬(수동/자동), 
 *       데이터 백업/복구, 다크모드, 단축키, Undo, 격언 등
 */

// --- 1. DOM 요소 선택 ---
const todoInput = document.getElementById('todo-input');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const clearCompletedBtn = document.getElementById('clear-completed');
const itemsLeftBadge = document.getElementById('items-left');
const emptyState = document.getElementById('empty-state');
const exportBtn = document.getElementById('export-btn');
const importBtnTrigger = document.getElementById('import-btn-trigger');
const importInput = document.getElementById('import-input');
const undoSnackbar = document.getElementById('undo-snackbar');
const undoBtn = document.getElementById('undo-btn');
const cheerMessage = document.getElementById('cheer-message');
const quoteText = document.getElementById('quote-text');

// --- 2. 상태 관리 ---
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = localStorage.getItem('currentFilter') || 'all';
let currentSort = localStorage.getItem('currentSort') || 'manual';
let currentTheme = localStorage.getItem('theme') || 'light';
let searchQuery = '';
let editingId = null;
let lastDeleted = null; // Undo 기능을 위한 변수
let undoTimeout = null;

const QUOTES = [
    "할 수 있다고 믿는다면, 당신은 이미 절반은 온 것입니다.",
    "작은 변화가 큰 차이를 만듭니다.",
    "어제보다 나은 오늘을 만드세요.",
    "계획 없는 목표는 단지 희망사항일 뿐입니다.",
    "성공은 매일 반복되는 작은 노력의 합계입니다."
];

// --- 3. 유틸리티 함수 ---

/**
 * 디바운싱: 잦은 함수 호출 방지 (저장, 검색용)
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSave = debounce(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('currentFilter', currentFilter);
    localStorage.setItem('currentSort', currentSort);
    updateDashboard();
}, 500);

/**
 * 상대 시간 포맷터
 */
function formatTimeAgo(dateString) {
    const diff = new Date() - new Date(dateString);
    const min = Math.floor(diff / 60000);
    const hrs = Math.floor(min / 60);
    if (min < 1) return '방금 전';
    if (min < 60) return `${min}분 전`;
    if (hrs < 24) return `${hrs}시간 전`;
    return `${Math.floor(hrs / 24)}일 전`;
}

// --- 4. 핵심 비즈니스 로직 ---

/**
 * 초기화 함수
 */
function init() {
    applyTheme();
    updateFilterUI();
    sortSelect.value = currentSort;
    renderTodos();
    updateDashboard();
    setRandomQuote();
    setupEventListeners();
}

/**
 * 할 일 추가 (중복 검사 포함)
 */
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    // 중복 검사
    if (todos.some(t => t.text === text && !t.completed)) {
        alert('이미 같은 내용의 할 일이 있습니다!');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        category: categorySelect.value,
        createdAt: new Date().toISOString(),
        order: todos.length // 수동 정렬을 위한 순서값
    };

    todos.push(newTodo);
    saveAndRender();
    todoInput.value = '';
    todoInput.focus();
}

/**
 * 할 일 삭제 & Undo 처리
 */
function deleteTodo(id) {
    const item = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (item) item.classList.add('fade-out');

    setTimeout(() => {
        lastDeleted = todos.find(t => t.id === id);
        todos = todos.filter(t => t.id !== id);
        saveAndRender();
        showUndoSnackbar();
    }, 300);
}

function showUndoSnackbar() {
    undoSnackbar.classList.remove('hidden');
    clearTimeout(undoTimeout);
    undoTimeout = setTimeout(() => undoSnackbar.classList.add('hidden'), 5000);
}

function undoDelete() {
    if (lastDeleted) {
        todos.push(lastDeleted);
        lastDeleted = null;
        undoSnackbar.classList.add('hidden');
        saveAndRender();
    }
}

/**
 * 데이터 내보내기 (JSON)
 */
function exportData() {
    const dataStr = JSON.stringify(todos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my_tasks_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * 데이터 가져오기 (JSON)
 */
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('올바른 형식이 아닙니다.');
            
            if (confirm('기존 데이터를 백업하고 새로운 데이터를 가져오시겠습니까?')) {
                todos = imported;
                saveAndRender();
                alert('데이터를 성공적으로 가져왔습니다.');
            }
        } catch (err) {
            alert('파일 읽기에 실패했습니다: ' + err.message);
        }
    };
    reader.readAsText(file);
}

/**
 * 대시보드 & 격언 업데이트
 */
function updateDashboard() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const progressText = document.getElementById('overall-progress-text');
    const progressFill = document.getElementById('overall-progress-fill');
    
    progressText.innerText = `${completed}/${total} 완료 (${percent}%)`;
    progressFill.style.width = `${percent}%`;

    // 응원 메시지
    if (percent === 100 && total > 0) cheerMessage.innerText = "🎉 대단해요! 모든 할 일을 마쳤습니다!";
    else if (percent > 70) cheerMessage.innerText = "거의 다 왔어요! 조금만 더 힘내세요!";
    else if (percent > 0) cheerMessage.innerText = "좋은 출발입니다! 하나씩 해결해볼까요?";
    else cheerMessage.innerText = "오늘도 새로운 도전을 시작해보세요!";

    // 카테고리별 통계
    const catStats = document.getElementById('category-stats');
    const labels = { work: '업무', personal: '개인', study: '공부' };
    catStats.innerHTML = ['work', 'personal', 'study'].map(cat => {
        const catTodos = todos.filter(t => t.category === cat);
        return `<div class="mini-stat-item">
            <span class="mini-dot" style="background-color: var(--${cat}-color)"></span>
            <span>${labels[cat]} ${catTodos.filter(t => t.completed).length}/${catTodos.length}</span>
        </div>`;
    }).join('');
}

function setRandomQuote() {
    quoteText.innerText = `"${QUOTES[Math.floor(Math.random() * QUOTES.length)]}"`;
}

/**
 * 렌더링 함수 (성능 최적화)
 */
function renderTodos() {
    // 필터링
    let filtered = todos.filter(t => {
        const matchesFilter = currentFilter === 'all' || t.category === currentFilter;
        const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // 정렬 로직
    if (currentSort === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (currentSort === 'oldest') filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (currentSort === 'category') filtered.sort((a, b) => a.category.localeCompare(b.category));
    else if (currentSort === 'status') filtered.sort((a, b) => a.completed - b.completed);
    else filtered.sort((a, b) => a.order - b.order); // 수동 정렬

    // DOM 업데이트
    todoList.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filtered.forEach(todo => {
        const li = createTodoElement(todo);
        fragment.appendChild(li);
    });

    todoList.appendChild(fragment);
    
    // 상태 배지 & 빈 화면 처리
    itemsLeftBadge.innerText = `${todos.filter(t => !t.completed).length}개 남음`;
    emptyState.classList.toggle('hidden', filtered.length > 0);
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;
    li.draggable = currentSort === 'manual';
    li.setAttribute('role', 'listitem');

    if (editingId === todo.id) {
        li.innerHTML = `
            <div class="edit-form">
                <input type="text" class="edit-input" value="${todo.text}" aria-label="수정 내용">
                <div class="edit-actions">
                    <select class="edit-category" aria-label="수정 카테고리">
                        <option value="work" ${todo.category === 'work' ? 'selected' : ''}>업무</option>
                        <option value="personal" ${todo.category === 'personal' ? 'selected' : ''}>개인</option>
                        <option value="study" ${todo.category === 'study' ? 'selected' : ''}>공부</option>
                    </select>
                    <span class="edit-tip">Enter 저장 / Esc 취소</span>
                </div>
            </div>`;
        const input = li.querySelector('.edit-input');
        input.focus();
        input.onkeydown = (e) => {
            if (e.key === 'Enter') saveEdit(todo.id, input.value, li.querySelector('.edit-category').value);
            if (e.key === 'Escape') { editingId = null; renderTodos(); }
        };
    } else {
        const labels = { work: '업무', personal: '개인', study: '공부' };
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="완료 체크">
            <div class="todo-content">
                <div class="todo-main">
                    <span class="category-tag ${todo.category}">${labels[todo.category]}</span>
                    <span class="todo-text">${todo.text}</span>
                </div>
                <span class="created-at">${formatTimeAgo(todo.createdAt)}</span>
            </div>
            <button class="delete-btn" aria-label="삭제">&times;</button>`;
        
        li.querySelector('input').onchange = () => {
            todo.completed = !todo.completed;
            saveAndRender();
        };
        li.querySelector('.todo-text').ondblclick = () => { editingId = todo.id; renderTodos(); };
        li.querySelector('.delete-btn').onclick = () => deleteTodo(todo.id);
        
        // 드래그 앤 드롭 핸들러 (수동 정렬 시)
        if (currentSort === 'manual') {
            li.addEventListener('dragstart', () => li.classList.add('dragging'));
            li.addEventListener('dragend', () => {
                li.classList.remove('dragging');
                updateOrderAfterDrag();
            });
        }
    }
    return li;
}

/**
 * 드래그 앤 드롭 후 순서 업데이트
 */
function updateOrderAfterDrag() {
    const items = [...todoList.querySelectorAll('.todo-item')];
    items.forEach((item, index) => {
        const id = parseInt(item.dataset.id);
        const todo = todos.find(t => t.id === id);
        if (todo) todo.order = index;
    });
    debouncedSave();
}

/**
 * 테마 적용
 */
function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
}

function saveAndRender() {
    debouncedSave();
    renderTodos();
}

function saveEdit(id, text, cat) {
    if (!text.trim()) return;
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.text = text;
        todo.category = cat;
    }
    editingId = null;
    saveAndRender();
}

// --- 5. 이벤트 리스너 ---

function setupEventListeners() {
    addBtn.onclick = addTodo;
    todoInput.onkeypress = (e) => e.key === 'Enter' && addTodo();

    filterBtns.forEach(btn => {
        btn.onclick = () => {
            currentFilter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.toggle('active', b === btn));
            saveAndRender();
        };
    });

    sortSelect.onchange = (e) => {
        currentSort = e.target.value;
        saveAndRender();
    };

    searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        renderTodos();
    };

    themeToggle.onclick = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme();
    };

    exportBtn.onclick = exportData;
    importBtnTrigger.onclick = () => importInput.click();
    importInput.onchange = importData;
    
    undoBtn.onclick = undoDelete;
    clearCompletedBtn.onclick = () => {
        if (confirm('완료된 항목을 모두 삭제하시겠습니까?')) {
            todos = todos.filter(t => !t.completed);
            saveAndRender();
        }
    };

    // 드래그 앤 드롭 정렬 로직
    todoList.addEventListener('dragover', e => {
        e.preventDefault();
        if (currentSort !== 'manual') return;
        const dragging = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(todoList, e.clientY);
        if (afterElement == null) todoList.appendChild(dragging);
        else todoList.insertBefore(dragging, afterElement);
    });

    // 단축키
    window.onkeydown = (e) => {
        if (e.altKey) {
            if (e.key === 'n') { e.preventDefault(); todoInput.focus(); }
            if (e.key === 's') { e.preventDefault(); searchInput.focus(); }
            if (e.key === 'd') { e.preventDefault(); themeToggle.click(); }
            if (['1','2','3','4'].includes(e.key)) filterBtns[parseInt(e.key)-1].click();
        }
    };
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
        else return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 초기화 실행
init();
