/**
 * Synapse OS - Core Renderer
 * 精致化标签管理与自动化环境适配
 */

const ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>`,
    browser: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    douyin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path><path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M15 2v16a4 4 0 0 1-4 4H9"></path><path d="M15 8a7 7 0 0 0 7 7"></path></svg>`,
    kuaishou: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    xiaohongshu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>`,
    bilibili: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M7 2l3 4M17 2l-3 4"></path><circle cx="8" cy="12" r="1"></circle><circle cx="16" cy="12" r="11"></circle></svg>`
};

class TabManager {
    constructor() {
        this.tabs = [];
        this.activeId = null;
        this.nextId = 1;
        this.hideTimeout = null;

        this.sidebar = document.getElementById('sidebar-tabs');
        this.container = document.getElementById('webview-container');
        this.urlBar = document.getElementById('url-bar');
        this.popup = document.getElementById('tab-popup');
        this.pUrlDisplay = document.getElementById('p-url-display');
        this.pUrlInput = document.getElementById('p-url-input');

        this.setupListeners();
        // 默认首页
        this.addTab('http://localhost:3000', 'home', true);
    }

    setupListeners() {
        document.getElementById('add-tab').onclick = () => {
            this.addTab('https://www.google.com', 'browser');
        };

        // 主地址栏监听
        this.urlBar.onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.navigate(this.urlBar.value);
                this.urlBar.blur();
            }
        };

        // 弹窗 URL 点击切换编辑态
        document.getElementById('p-url-container').onclick = (e) => {
            this.pUrlDisplay.style.display = 'none';
            this.pUrlInput.style.display = 'block';
            this.pUrlInput.focus();
            this.pUrlInput.select();
        };

        this.pUrlInput.onblur = () => {
            this.pUrlDisplay.style.display = 'block';
            this.pUrlInput.style.display = 'none';
        };

        this.pUrlInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.navigate(this.pUrlInput.value);
                this.pUrlInput.blur();
            }
        };

        // 底部工具栏控制
        const goBack = () => this.activeTab()?.webview.canGoBack() && this.activeTab().webview.goBack();
        const goForward = () => this.activeTab()?.webview.canGoForward() && this.activeTab().webview.goForward();
        const reload = () => this.activeTab()?.webview.reload();

        document.getElementById('p-back').onclick = goBack;
        document.getElementById('p-forward').onclick = goForward;
        document.getElementById('p-reload').onclick = reload;

        document.getElementById('back').onclick = goBack;
        document.getElementById('forward').onclick = goForward;
        document.getElementById('reload').onclick = reload;
        document.getElementById('p-copy').onclick = () => {
            const url = this.activeTab()?.webview.getURL();
            if (url) {
                navigator.clipboard.writeText(url);
                const originalTitle = document.getElementById('p-title').textContent;
                document.getElementById('p-title').textContent = '已复制到剪贴板 !';
                setTimeout(() => { document.getElementById('p-title').textContent = originalTitle; }, 1500);
            }
        };

        document.getElementById('p-close').onclick = () => {
            this.removeTab(this.popup.dataset.tabId);
            this.hidePopup();
        };

        // 弹窗悬浮逻辑
        this.popup.onmouseleave = () => this.hidePopup();
        this.popup.onmouseenter = () => { if (this.hideTimeout) clearTimeout(this.hideTimeout); };

        // 监听来自内部页面的消息 (用于创作者中心集成)
        window.addEventListener('message', (event) => {
            if (event.data.type === 'OPEN_CREATOR_TAB') {
                const { url, cookies, platform } = event.data;
                this.addTabWithCookies(url, cookies, platform);
            }
        });
    }

    async addTabWithCookies(url, cookies, platform = 'browser') {
        const id = this.addTab(url, platform);
        const partition = `persist:${id}`;

        if (window.electronAPI && window.electronAPI.session) {
            console.log(`[Shell] Injecting ${cookies.length} cookies into ${partition} for ${platform}`);
            await window.electronAPI.session.setCookies(partition, cookies);
            // 重新加载以使 Cookie 生效
            const tab = this.tabs.find(t => t.id === id);
            if (tab) tab.webview.reload();
        }
    }

    navigate(url) {
        if (!url) return;
        let finalUrl = url;
        if (!finalUrl.startsWith('http') && !finalUrl.includes('localhost')) {
            if (finalUrl.includes('.') && !finalUrl.includes(' ')) finalUrl = 'https://' + finalUrl;
            else finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(finalUrl);
        }

        const active = this.activeTab();
        if (active) {
            active.webview.loadURL(finalUrl);
        }
    }

    addTab(url, type = 'browser', pinned = false) {
        if (!url) return;
        const id = `tab-${this.nextId++}`;

        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';
        tabItem.id = `btn-${id}`;
        tabItem.dataset.id = id;

        // 根据类型选择图标
        const iconHtml = pinned ? ICONS.home : (ICONS[type] || ICONS.browser);
        tabItem.innerHTML = iconHtml;

        if (!pinned) {
            const closeBtn = document.createElement('div');
            closeBtn.className = 'tab-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = (e) => { e.stopPropagation(); this.removeTab(id); };
            tabItem.appendChild(closeBtn);
        }

        tabItem.onclick = () => this.switchTab(id);
        tabItem.onmouseenter = () => {
            if (this.hideTimeout) clearTimeout(this.hideTimeout);
            this.showPopup(id);
        };
        tabItem.onmouseleave = () => {
            this.hideTimeout = setTimeout(() => {
                if (!this.popup.matches(':hover')) this.hidePopup();
            }, 300); // 稍微加长延迟，方便移动
        };

        this.sidebar.appendChild(tabItem);

        const webview = document.createElement('webview');
        webview.id = `wv-${id}`;
        webview.src = url;
        webview.setAttribute('allowpopups', '');
        webview.setAttribute('partition', pinned ? 'persist:main' : `persist:${id}`);
        webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        this.container.appendChild(webview);

        const tabData = { id, webview, tabItem, url, title: '会话加载中...', type, pinned };
        this.tabs.push(tabData);

        // 拦截新窗口
        webview.addEventListener('new-window', (e) => {
            e.preventDefault();
            this.addTab(e.url, 'browser');
        });

        // 核心：实时同步 URL 和标题 (修复百度/Google Mismatch)
        const updateInfo = () => {
            tabData.url = webview.getURL();
            tabData.title = webview.getTitle();
            if (id === this.activeId) {
                this.urlBar.value = tabData.url;
                if (this.popup.style.display === 'block' && this.popup.dataset.tabId === id) {
                    this.syncPopupInfo(tabData);
                }
            }
        };

        webview.addEventListener('did-finish-load', updateInfo);
        webview.addEventListener('did-navigate', updateInfo);
        webview.addEventListener('did-navigate-in-page', updateInfo);
        webview.addEventListener('page-title-updated', (e) => {
            tabData.title = e.title;
            if (id === this.activeId && this.popup.style.display === 'block') {
                document.getElementById('p-title').textContent = e.title;
            }
        });

        this.switchTab(id);
        return id;
    }

    switchTab(id) {
        this.tabs.forEach(t => {
            t.webview.classList.remove('active');
            t.tabItem.classList.remove('active');
        });

        const active = this.tabs.find(t => t.id === id);
        if (active) {
            active.webview.classList.add('active');
            active.tabItem.classList.add('active');
            this.urlBar.value = active.webview.getURL() || active.url;
            this.activeId = id;
        }
    }

    removeTab(id) {
        const index = this.tabs.findIndex(t => t.id === id);
        if (index === -1) return;
        const tab = this.tabs[index];
        if (tab.pinned) return;

        tab.webview.remove();
        tab.tabItem.remove();
        this.tabs.splice(index, 1);

        if (this.activeId === id && this.tabs.length > 0) {
            this.switchTab(this.tabs[this.tabs.length - 1].id);
        }
    }

    activeTab() {
        return this.tabs.find(t => t.id === this.activeId);
    }

    showPopup(id) {
        const tab = this.tabs.find(t => t.id === id);
        if (!tab) return;

        const rect = tab.tabItem.getBoundingClientRect();
        this.popup.style.top = `${rect.top}px`;
        this.popup.style.display = 'block';
        this.popup.dataset.tabId = id;

        this.syncPopupInfo(tab);

        // 强制重置编辑态为展示态
        this.pUrlDisplay.style.display = 'block';
        this.pUrlInput.style.display = 'none';
    }

    syncPopupInfo(tab) {
        document.getElementById('p-title').textContent = tab.title || (tab.pinned ? 'Synapse OS' : '无标题会话');
        this.pUrlDisplay.textContent = tab.webview.getURL() || tab.url;
        this.pUrlInput.value = tab.webview.getURL() || tab.url;
    }

    hidePopup() {
        this.popup.style.display = 'none';
    }
}

window.onload = () => { new TabManager(); };
