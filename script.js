// Bonfire Core Script

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const contentEl = document.getElementById('content');
    const inputEl = document.getElementById('markdown-input');
    const editView = document.getElementById('edit-view');
    const saveBtn = document.getElementById('save-btn');
    const discardBtn = document.getElementById('discard-btn');
    const closeEditorBtn = document.getElementById('close-editor-btn');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.querySelector('.close-modal');

    const globalCopyBtn = document.getElementById('global-copy-btn');
    const unsavedNotice = document.getElementById('unsaved-notice');
    const app = document.getElementById('app');

    // State
    const STORAGE_KEY = 'bonfire_content';
    let isDirty = false;
    let isUsingWebStorage = false;

    // --- Data Loading ---
    function loadData() {
        // 1. Check WebStorage (Auto-save)
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            console.log('Loaded from WebStorage');
            isUsingWebStorage = true;
            return saved;
        }

        // 2. Check User Data (data.js)
        if (typeof bonfireUserData !== 'undefined' && bonfireUserData) {
            console.log('Loaded from User Data File');
            return bonfireUserData;
        }

        // 3. Fallback to Example Data
        if (typeof bonfireDefaultData !== 'undefined') {
            console.log('Loaded from Default Data');
            return bonfireDefaultData;
        }

        return '# Hello Bonfire\nNo data found.';
    }

    const initialContent = loadData();
    inputEl.value = initialContent;

    // Initial Notice Check
    if (isUsingWebStorage) {
        unsavedNotice.classList.remove('hidden');
        app.classList.add('has-notice');
    } else {
        unsavedNotice.classList.add('hidden');
        app.classList.remove('has-notice');
    }

    render(initialContent);

    // ... (parsing logic unchanged) ...
    // Note: I will use ReplaceChunk to avoid rewriting the whole file, targeting specific sections.
    // Wait, I cannot use `...` in ReplacementContent. I must include the full block or use multiple ReplaceChunks.
    // I will rewrite the Render function separately if needed, but here I am focusing on init logic.
    // The previous view_file was small, let me just act on the init block.

    // --- Markdown Parser Configuration & Custom Extensions ---

    function preprocessMarkdown(markdown) {
        let processed = markdown;
        const placeholders = [];

        // 1. Protect code blocks and spans
        processed = processed.replace(/(```[\s\S]*?```|`[^`\n]*`)/g, (match) => {
            const id = `__BT_PLACEHOLDER_${placeholders.length}__`;
            placeholders.push({ id, original: match });
            return id;
        });

        // 2. Custom Syntax Replacements (Inline elements first)
        // Icons
        processed = processed.replace(/icon:fa-([a-z0-9-]+)/g, '<i class="fa-solid fa-$1"></i>');

        // Images
        // Support image:filename (rounded) and image@:filename (circular profile)
        processed = processed.replace(/image(@?):([a-zA-Z0-9._-]+)/g, (match, at, filename) => {
            const className = at === '@' ? 'profile-image' : 'rounded-image';
            return `<img src="images/${filename}" alt="${filename}" class="${className}">`;
        });

        // Block Elements
        // Center Container
        processed = processed.replace(/:::\s*center\s*\n([\s\S]*?)\n:::/gm, (match, content) => {
            const innerHtml = typeof marked !== 'undefined' ? marked.parse(content) : content;
            return `<div class="center-container">\n${innerHtml}\n</div>`;
        });

        // Cards
        processed = processed.replace(/:::\s*card\s*([^\n]*)\n([\s\S]*?)\n:::/gm, (match, title, content) => {
            const innerHtml = typeof marked !== 'undefined' ? marked.parse(content) : content;
            return `<div class="card"><div class="card-title">${title}</div><div class="card-body">\n${innerHtml}\n</div></div>`;
        });

        // Link Cards
        processed = processed.replace(/:::\s*link\s*([^\n]*)\n([\s\S]*?)\n:::/gm, (match, linkData, content) => {
            let url = linkData.trim();
            let alt = '';

            // Match [alt](url) format
            const altMatch = url.match(/^\[(.*?)\]\((.*?)\)$/);
            if (altMatch) {
                alt = altMatch[1];
                url = altMatch[2];
            }

            const innerHtml = typeof marked !== 'undefined' ? marked.parse(content) : content;
            const ariaAttr = alt ? ` aria-label="${alt}"` : '';
            return `<a href="${url}" class="link-card"${ariaAttr} target="_blank">\n${innerHtml}\n</a>`;
        });

        // Grids
        processed = processed.replace(/:::\s*grid\s*\n([\s\S]*?)\n:::/gm, (match, content) => {
            const parts = content.split(/^\s*\|\s*$/gm);
            if (parts.length > 1) {
                const gridItems = parts.map(p => {
                    const inner = typeof marked !== 'undefined' ? marked.parse(p.trim()) : p;
                    return `<div>${inner}</div>`;
                }).join('\n');
                return `<div class="grid-container">\n${gridItems}\n</div>`;
            }
            return `<div class="grid-container">\n${content}\n</div>`;
        });

        // 3. Restore protected code
        for (let i = placeholders.length - 1; i >= 0; i--) {
            processed = processed.replace(placeholders[i].id, placeholders[i].original);
        }

        return processed;
    }

    function render(markdown) {
        // Pre-process custom syntax (which now handles its own inner marked.parse)
        let html = preprocessMarkdown(markdown);

        // Final pass for the rest of the document
        if (typeof marked !== 'undefined') {
            contentEl.innerHTML = marked.parse(html);
        } else {
            contentEl.innerHTML = html;
        }

        // Update Page Title based on first H1
        const titleMatch = markdown.match(/^#\s+(.+)$/m);
        if (titleMatch && titleMatch[1]) {
            document.title = titleMatch[1].trim();
        }
    }

    // --- Editor Logic ---
    function toggleEditor() {
        editView.classList.toggle('hidden');
        if (!editView.classList.contains('hidden')) {
            // Adjust main view width if desktop
            // This logic needs to match CSS media queries
            if (window.innerWidth > 768) {
                document.getElementById('main-view').style.marginRight = '50%';
            }
            inputEl.focus();
        } else {
            document.getElementById('main-view').style.marginRight = '0';
        }
    }

    // Shortcut: Ctrl+B (or Cmd+B)
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'b' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            toggleEditor();
        }
    });

    closeEditorBtn.addEventListener('click', toggleEditor);

    // Auto-save & Preview
    inputEl.addEventListener('input', (e) => {
        const val = e.target.value;
        render(val);
        localStorage.setItem(STORAGE_KEY, val);
        isDirty = true;
        isUsingWebStorage = true; // Now we are using storage

        // Show notice
        unsavedNotice.classList.remove('hidden');
        app.classList.add('has-notice');

        saveBtn.innerHTML = '<i class="fa fa-clipboard"></i> コピー';
        // Removed statusMsg update as requested
    });

    // Copy to Clipboard (Editor)
    saveBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(inputEl.value).then(() => {
            alert('クリップボードにコピーしました！\n\nプロジェクトフォルダの `data.js` ファイルを開き、\n`bonfireUserData` 変数の中身を書き換えて保存してください。');
        });
    });

    // Discard Changes
    discardBtn.addEventListener('click', () => {
        console.log('Discard button clicked');
        if (confirm('現在の変更を全て破棄して、元のファイル（data.js またはデフォルト）の状態に戻しますか？')) {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Storage cleared');

            // Re-load default data
            let originalContent = '';
            if (typeof bonfireUserData !== 'undefined' && bonfireUserData) {
                originalContent = bonfireUserData;
            } else if (typeof bonfireDefaultData !== 'undefined') {
                originalContent = bonfireDefaultData;
            } else {
                originalContent = '# Hello Bonfire\nNo data found.';
            }

            inputEl.value = originalContent;
            render(originalContent);
            isDirty = false;
            isUsingWebStorage = false;

            // Hide notice
            unsavedNotice.classList.add('hidden');
            app.classList.remove('has-notice');

            // statusMsg.innerText = '変更を破棄しました'; // Removed or kept? User said remove "Auto-saved" text.
            // Keeping "Discarded" feedback might be nice, but user wanted less noise. Let's keep it minimal.
            // Actually, statusMsg element was removed from HTML previously! I must remove reference to it.
            console.log('UI Reset complete');
        }
    });

    // Help
    helpBtn.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
    });
    closeModal.addEventListener('click', () => {
        helpModal.classList.add('hidden');
    });

    // Global Copy (from notice bar)
    globalCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(inputEl.value).then(() => {
            alert('クリップボードにコピーしました！\n\nプロジェクトフォルダの `data.js` ファイルを開き、\n`bonfireUserData` 変数の中身を書き換えて保存してください。');
        });
    });

    // Favicon (🔥)
    function setStaticFavicon() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);

        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔥', 16, 18);

        link.href = canvas.toDataURL("image/x-icon");
    }
    setStaticFavicon();
});
