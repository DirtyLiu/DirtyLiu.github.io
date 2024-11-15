class WordLearner {
    constructor() {
        this.manualState = {
            wordsArray: [],
            translationsArray: [],
            currentIndex: 0,
            wordInput: '',
            translationInput: ''
        };
        
        this.pasteState = {
            wordsArray: [],
            translationsArray: [],
            wordInput: '',
            translationInput: ''
        };

        this.currentState = this.manualState;
        this.wordsArray = [];
        this.translationsArray = [];
        this.currentIndex = 0;
        
        // 确保DOM加载完成后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initializeElements() {
        // 获取必要的元素
        this.wordInput = document.getElementById('wordInput');
        this.translationInput = document.getElementById('translationInput');
        this.prevWordBtn = document.getElementById('prevWordBtn');
        this.nextWordBtn = document.getElementById('nextWordBtn');
        this.wordNumber = document.getElementById('wordNumber');
        this.translationNumber = document.getElementById('translationNumber');
        this.wordsPreview = document.getElementById('wordsPreview');
        this.translationsPreview = document.getElementById('translationsPreview');
        this.startBtn = document.getElementById('startBtn');
        this.uploadProgressText = document.getElementById('uploadProgressText');
        this.learningPage = document.getElementById('learningPage');
        this.uploadPage = document.getElementById('uploadPage');
        this.currentWordDisplay = document.getElementById('currentWord');
        this.currentTranslationDisplay = document.getElementById('currentTranslation');
        this.learningProgressText = document.getElementById('learningProgressText');
        this.showTranslationBtn = document.getElementById('showTranslationBtn');

        // 确保所有元素都存在
        if (!this.wordInput || !this.translationInput || !this.wordsPreview || !this.translationsPreview) {
            console.error('Some required elements are missing');
        }
    }

    initializeInputModes() {
        this.manualInputBtn = document.getElementById('manualInputBtn');
        this.pasteInputBtn = document.getElementById('pasteInputBtn');
        
        // 绑定模式切换事件
        this.manualInputBtn.addEventListener('click', () => this.switchInputMode('manual'));
        this.pasteInputBtn.addEventListener('click', () => this.switchInputMode('paste'));
    }

    switchInputMode(mode) {
        // 保存当前状态
        this.saveCurrentState();

        // 更新按钮状态
        this.manualInputBtn.classList.toggle('active', mode === 'manual');
        this.pasteInputBtn.classList.toggle('active', mode === 'paste');

        // 添加/移除粘贴模式的类
        const inputSection = document.querySelector('.input-section');
        inputSection.classList.toggle('paste-mode', mode !== 'manual');

        // 切换到对应的状态
        this.currentState = mode === 'manual' ? this.manualState : this.pasteState;

        if (mode === 'manual') {
            // 手动输入模式
            this.wordInput.placeholder = "输入当前单词";
            this.translationInput.placeholder = "输入当前单词的翻译，可以包含多行解释";
            
            // 启用导航按钮
            this.nextWordBtn.style.display = 'block';
            this.prevWordBtn.style.display = 'block';
            
        } else {
            // 粘贴输入模式
            this.wordInput.placeholder = "粘贴英文单词，用空格或换行分隔";
            this.translationInput.placeholder = "粘贴中文翻译，每个翻译用换行分隔";
            
            // 隐藏导航按钮
            this.nextWordBtn.style.display = 'none';
            this.prevWordBtn.style.display = 'none';
        }

        // 恢复对应模式的状态
        this.restoreState();

        // 更新清空按钮文本
        this.clearBtn.textContent = `清空${mode === 'manual' ? '手动输入' : '粘贴输入'}内容`;
    }

    // 保存当前状态
    saveCurrentState() {
        const currentMode = this.manualInputBtn.classList.contains('active') ? 'manual' : 'paste';
        const state = currentMode === 'manual' ? this.manualState : this.pasteState;

        state.wordsArray = [...this.wordsArray];
        state.translationsArray = [...this.translationsArray];
        state.wordInput = this.wordInput.value;
        state.translationInput = this.translationInput.value;
        
        if (currentMode === 'manual') {
            state.currentIndex = this.currentIndex;
        }
    }

    // 恢复状态
    restoreState() {
        this.wordsArray = [...this.currentState.wordsArray];
        this.translationsArray = [...this.currentState.translationsArray];
        this.wordInput.value = this.currentState.wordInput;
        this.translationInput.value = this.currentState.translationInput;
        
        if (this.manualInputBtn.classList.contains('active')) {
            this.currentIndex = this.currentState.currentIndex;
            this.wordNumber.textContent = this.currentIndex + 1;
            this.translationNumber.textContent = this.currentIndex + 1;
        }

        this.updatePreview();
    }

    bindEvents() {
        // 绑定导航按钮事件
        this.nextWordBtn.addEventListener('click', () => this.moveToNext());
        this.prevWordBtn.addEventListener('click', () => this.moveToPrevious());
        
        // 修改粘贴事件处理
        this.wordInput.addEventListener('paste', (e) => {
            if (this.pasteInputBtn.classList.contains('active')) {
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                // 将每个单词分开存储
                this.wordsArray = text.trim().split(/[\s\n]+/);
                // 显示在输入框中
                this.wordInput.value = this.wordsArray.join('\n');
                this.updatePreview();
            }
        });

        this.wordInput.addEventListener('input', () => {
            if (this.pasteInputBtn.classList.contains('active')) {
                // 将输入的文本分割成单词数组
                this.wordsArray = this.wordInput.value.trim().split(/[\s\n]+/).filter(word => word);
                this.updatePreview();
            }
        });

        this.translationInput.addEventListener('paste', (e) => {
            if (this.pasteInputBtn.classList.contains('active')) {
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                const translations = text.trim().split(/[\s\n]+/);
                this.translationInput.value = translations.join('\n');
                this.translationsArray = translations;
                this.currentState.translationsArray = translations;
                this.updatePreview();
            }
        });

        this.translationInput.addEventListener('input', () => {
            if (this.pasteInputBtn.classList.contains('active')) {
                const translations = this.translationInput.value.trim().split(/[\s\n]+/);
                this.translationsArray = translations.filter(trans => trans);
                this.currentState.translationsArray = [...this.translationsArray];
                this.updatePreview();
            }
        });

        // 添加开始学习按钮的事件绑定
        this.startBtn.addEventListener('click', () => this.startLearning());
        
        // 添加显示翻译按钮的事件绑定
        this.showTranslationBtn.addEventListener('click', () => this.toggleTranslation());
    }

    bindPreviewClickEvents() {
        const previewContainer = document.querySelector('.preview-container');
        previewContainer.addEventListener('click', (e) => {
            // 查找被点击的单词项
            const wordItem = this.findClickedWordItem(e.target);
            if (wordItem) {
                const index = this.findWordItemIndex(wordItem);
                if (index !== -1) {
                    this.editWordAtIndex(index);
                }
            }
        });
    }

    findClickedWordItem(element) {
        while (element && !element.classList.contains('word-item')) {
            element = element.parentElement;
            if (element === document.body) return null;
        }
        return element;
    }

    findWordItemIndex(wordItem) {
        // 获取所有word-item元
        const numberItems = document.querySelectorAll('.number-column .word-item');
        const wordItems = this.wordsPreview.querySelectorAll('.word-item');
        const translationItems = this.translationsPreview.querySelectorAll('.word-item');
        
        // 检查点击的是哪一列的元素
        if (numberItems.length > 0 && Array.from(numberItems).includes(wordItem)) {
            return Array.from(numberItems).indexOf(wordItem);
        } else if (wordItems.length > 0 && Array.from(wordItems).includes(wordItem)) {
            return Array.from(wordItems).indexOf(wordItem);
        } else if (translationItems.length > 0 && Array.from(translationItems).includes(wordItem)) {
            return Array.from(translationItems).indexOf(wordItem);
        }
        
        return -1;
    }

    editWordAtIndex(index) {
        // 保存当前输入
        const currentWord = this.wordInput.value.trim();
        const currentTranslation = this.translationInput.value.trim();
        
        if (currentWord) {
            this.wordsArray[this.currentIndex] = currentWord;
            this.translationsArray[this.currentIndex] = currentTranslation;
        }

        // 更新当前索引
        this.currentIndex = index;
        
        // 更新输入框内容
        this.wordInput.value = this.wordsArray[index] || '';
        this.translationInput.value = this.translationsArray[index] || '';
        
        // 更新序号显示
        this.wordNumber.textContent = index + 1;
        this.translationNumber.textContent = index + 1;
        
        // 更新按钮状态
        this.prevWordBtn.disabled = index === 0;
        
        // 更新预览
        this.updatePreview();
        
        // 聚焦到单词输入框
        this.wordInput.focus();

        // 滚动输入框到视图
        this.wordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    moveToNext() {
        // 保存当前输入
        const word = this.wordInput.value.trim();
        const translation = this.translationInput.value.trim();
        
        if (word || translation) { // 修改条件，允许只有翻译
            if (word) this.wordsArray[this.currentIndex] = word;
            if (translation) this.translationsArray[this.currentIndex] = translation;
        }
        
        // 移动到下一个
        this.currentIndex++;
        
        // 显示下一个的内容（如果存在）
        this.wordInput.value = this.wordsArray[this.currentIndex] || '';
        this.translationInput.value = this.translationsArray[this.currentIndex] || '';
        
        // 更新序号和预览
        this.wordNumber.textContent = this.currentIndex + 1;
        this.translationNumber.textContent = this.currentIndex + 1;
        this.updatePreview();
        
        // 更新按钮状态
        this.prevWordBtn.disabled = false;
        
        // 聚焦到单词输入框
        this.wordInput.focus();
    }

    moveToPrevious() {
        if (this.currentIndex > 0) {
            // 保存当前输入
            const word = this.wordInput.value.trim();
            const translation = this.translationInput.value.trim();
            
            if (word || translation) { // 修改条件许只有翻译
                if (word) this.wordsArray[this.currentIndex] = word;
                if (translation) this.translationsArray[this.currentIndex] = translation;
            }
            
            // 移动到上一个
            this.currentIndex--;
            
            // 显示上一个的内容
            this.wordInput.value = this.wordsArray[this.currentIndex] || '';
            this.translationInput.value = this.translationsArray[this.currentIndex] || '';
            
            // 更新序号和预览
            this.wordNumber.textContent = this.currentIndex + 1;
            this.translationNumber.textContent = this.currentIndex + 1;
            this.updatePreview();
            
            // 更新按钮状态
            this.prevWordBtn.disabled = this.currentIndex === 0;
            
            // 聚焦到单词输入框
            this.wordInput.focus();
        }
    }

    updatePreview() {
        // 获取最大长度（英文和中文的最大数量）
        const maxLength = Math.max(this.wordsArray.length, this.translationsArray.length);

        // 创建序号列
        const numberColumnHTML = Array.from({ length: maxLength })
            .map((_, index) => `
                <div class="word-item">
                    <div class="word-number">${String(index + 1).padStart(3, '0')}</div>
                </div>
            `)
            .join('');

        // 修改单词项的生成方式
        const createWordItem = (content, index) => `
            <div class="word-item" data-index="${index}">
                <div class="word-content">${content || ''}</div>
            </div>
        `;

        // 更新预览内容，使用maxLength来生成内容
        this.wordsPreview.innerHTML = Array.from({ length: maxLength })
            .map((_, index) => createWordItem(this.wordsArray[index] || '', index))
            .join('');
            
        this.translationsPreview.innerHTML = Array.from({ length: maxLength })
            .map((_, index) => createWordItem(this.translationsArray[index] || '', index))
            .join('');

        // 创建并添加元素
        const numberColumn = document.createElement('div');
        numberColumn.className = 'number-column';
        numberColumn.innerHTML = numberColumnHTML;

        // 清空并重新添加内容
        const previewContent = this.wordsPreview.parentElement;
        previewContent.innerHTML = '';
        previewContent.appendChild(numberColumn);
        previewContent.appendChild(document.createElement('div')).className = 'preview-divider-number';
        previewContent.appendChild(this.wordsPreview);
        previewContent.appendChild(document.createElement('div')).className = 'preview-divider-middle';
        previewContent.appendChild(this.translationsPreview);

        // 同步所有行的高度
        this.syncRowHeights();
            
        // 更新单词数量
        this.uploadProgressText.textContent = `${maxLength}个单词`;

        // 添加可点击的样式
        const allItems = document.querySelectorAll('.word-item');
        allItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.title = '点击编辑';
        });
    }

    // 同步每一行的高度
    syncRowHeights() {
        const numberItems = document.querySelectorAll('.number-column .word-item');
        const wordItems = this.wordsPreview.querySelectorAll('.word-item');
        const translationItems = this.translationsPreview.querySelectorAll('.word-item');

        let totalHeight = 0;
        const maxLength = Math.max(this.wordsArray.length, this.translationsArray.length);

        // 遍历每一行，使用maxLength而不是wordsArray.length
        for (let i = 0; i < maxLength; i++) {
            const numberItem = numberItems[i];
            const wordItem = wordItems[i];
            const translationItem = translationItems[i];

            if (numberItem && wordItem && translationItem) {
                // 获取内容的实际高度
                const wordContentHeight = wordItem.querySelector('.word-content').offsetHeight;
                const translationContentHeight = translationItem.querySelector('.word-content').offsetHeight;
                
                // 找出最大度
                const maxHeight = Math.max(wordContentHeight, translationContentHeight);
                const rowHeight = maxHeight + 20;

                // 设置所有元素的高度
                numberItem.style.height = `${rowHeight}px`;
                wordItem.style.height = `${rowHeight}px`;
                translationItem.style.height = `${rowHeight}px`;

                // 添加分隔线（除了最后一行）
                if (i < maxLength - 1) {
                    const divider = document.createElement('div');
                    divider.className = 'full-width-divider';
                    totalHeight += rowHeight;
                    divider.style.top = `${totalHeight}px`;
                    this.wordsPreview.parentElement.appendChild(divider);
                }

                // 更新总高度
                if (i === maxLength - 1) {
                    totalHeight += rowHeight;
                }
            }
        }

        // 设置容器的最小高度
        this.wordsPreview.parentElement.style.minHeight = `${totalHeight}px`;
    }

    startLearning() {
        // 获取预览区的内容作为学习内容
        const maxLength = Math.max(this.wordsArray.length, this.translationsArray.length);
        
        if (maxLength === 0) {
            alert('请先输入要学习的内容！');
            return;
        }

        // 创建随机顺序的索引数组
        this.shuffledIndices = Array.from({ length: maxLength }, (_, i) => i);
        this.shuffleArray(this.shuffledIndices);

        // 切换到学习页面
        this.uploadPage.classList.add('hidden');
        this.learningPage.classList.remove('hidden');

        // 初始化学习状态
        this.currentIndex = 0;

        // 显示第一个单词
        this.displayCurrentWord();

        // 绑定学习页面的按钮事件
        this.bindLearningPageEvents();
    }

    // 添加数组随机排序方法
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    bindLearningPageEvents() {
        // 先移除旧的事件监听器
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const endBtn = document.getElementById('endBtn');

        // 使用 clone 方式移除所有事件监听器
        const newPrevBtn = prevBtn.cloneNode(true);
        const newNextBtn = nextBtn.cloneNode(true);
        const newEndBtn = endBtn.cloneNode(true);
        
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        endBtn.parentNode.replaceChild(newEndBtn, endBtn);

        // 绑定新的事件监听器
        newPrevBtn.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.displayCurrentWord();
            }
        });

        newNextBtn.addEventListener('click', () => {
            const maxLength = Math.max(this.wordsArray.length, this.translationsArray.length);
            if (this.currentIndex < maxLength - 1) {
                this.currentIndex++;
                this.displayCurrentWord();
            }
        });

        newEndBtn.addEventListener('click', () => {
            this.learningPage.classList.add('hidden');
            this.uploadPage.classList.remove('hidden');
        });
    }

    displayCurrentWord() {
        const maxLength = Math.max(this.wordsArray.length, this.translationsArray.length);
        // 使用随机索引获取单词和翻译
        const randomIndex = this.shuffledIndices[this.currentIndex];
        const currentWord = this.wordsArray[randomIndex];
        const currentTranslation = this.translationsArray[randomIndex] || '（未添加翻译）';
        
        this.currentWordDisplay.textContent = currentWord;
        this.currentTranslationDisplay.textContent = currentTranslation;
        
        // 隐藏翻译
        this.currentTranslationDisplay.classList.add('hidden');
        this.showTranslationBtn.textContent = '显示翻译';
        
        // 更新进度显示
        this.learningProgressText.textContent = `${this.currentIndex + 1}/${maxLength}`;

        // 更新按钮状态
        document.getElementById('prevBtn').disabled = this.currentIndex === 0;
        document.getElementById('nextBtn').disabled = this.currentIndex === maxLength - 1;
    }

    toggleTranslation() {
        if (this.currentTranslationDisplay.classList.contains('hidden')) {
            this.currentTranslationDisplay.classList.remove('hidden');
            this.showTranslationBtn.textContent = '隐藏翻译';
        } else {
            this.currentTranslationDisplay.classList.add('hidden');
            this.showTranslationBtn.textContent = '显示翻译';
        }
    }

    // 添加删除按钮事件绑方法
    bindDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止冒泡，防止触发编辑
                const index = parseInt(button.getAttribute('data-index'));
                this.deleteWord(index);
            });
        });
    }

    // 添加删除单词方法
    deleteWord(index) {
        if (confirm('确定要删除这个单词吗？')) {
            // 删除单词和翻译
            this.wordsArray.splice(index, 1);
            this.translationsArray.splice(index, 1);

            // 如果删除的是当前编辑的单词，调整currentIndex
            if (index === this.currentIndex) {
                this.currentIndex = Math.min(this.currentIndex, this.wordsArray.length - 1);
                if (this.currentIndex < 0) this.currentIndex = 0;
                
                // 更新输入框
                this.wordInput.value = this.wordsArray[this.currentIndex] || '';
                this.translationInput.value = this.translationsArray[this.currentIndex] || '';
                
                // 更新序号显示
                this.wordNumber.textContent = this.currentIndex + 1;
                this.translationNumber.textContent = this.currentIndex + 1;
            }

            // 更新预览
            this.updatePreview();
            
            // 更新按钮状态
            this.prevWordBtn.disabled = this.currentIndex === 0;
        }
    }

    bindDeleteWordButton() {
        this.deleteWordBtn.addEventListener('click', () => {
            if (this.currentIndex < this.wordsArray.length) {
                this.deleteWord(this.currentIndex);
            }
        });
    }

    // 添加初始化方法
    initialize() {
        this.initializeElements();
        this.bindEvents();
        this.bindPreviewClickEvents();
        this.deleteWordBtn = document.getElementById('deleteWordBtn');
        this.bindDeleteWordButton();
        this.initializeInputModes();
        this.clearBtn = document.getElementById('clearBtn');
        this.bindClearButton();
    }

    bindClearButton() {
        this.clearBtn.addEventListener('click', () => this.confirmClear());
    }

    confirmClear() {
        const mode = this.manualInputBtn.classList.contains('active') ? '手动输入' : '粘贴输入';
        if (confirm(`确定要清空${mode}模式下的所有内容吗？`)) {
            this.clearCurrentMode();
        }
    }

    clearCurrentMode() {
        if (this.manualInputBtn.classList.contains('active')) {
            // 清空手动输入模式的所有状态
            this.manualState = {
                wordsArray: [],
                translationsArray: [],
                currentIndex: 0,
                wordInput: '',
                translationInput: ''
            };
            
            // 如果当前是手动输入模式，清空当前显示
            if (this.currentState === this.manualState) {
                this.wordsArray = [];
                this.translationsArray = [];
                this.currentIndex = 0;
                this.wordInput.value = '';
                this.translationInput.value = '';
                this.wordNumber.textContent = '1';
                this.translationNumber.textContent = '1';
            }
        } else {
            // 清空粘贴输入模式的所有状态
            this.pasteState = {
                wordsArray: [],
                translationsArray: [],
                wordInput: '',
                translationInput: ''
            };
            
            // 如果当前是粘贴输入模式，清空当前显示
            if (this.currentState === this.pasteState) {
                this.wordsArray = [];
                this.translationsArray = [];
                this.wordInput.value = '';
                this.translationInput.value = '';
            }
        }

        // 无论是哪种模，都要清空当前显示的内容
        this.currentState = this.manualInputBtn.classList.contains('active') ? this.manualState : this.pasteState;
        this.wordsArray = [];
        this.translationsArray = [];
        this.wordInput.value = '';
        this.translationInput.value = '';
        
        // 重置序号
        this.currentIndex = 0;
        this.wordNumber.textContent = '1';
        this.translationNumber.textContent = '1';

        // 更新预览区域
        this.updatePreview();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new WordLearner();
}); 