// 主逻辑文件
// 全局变量
let digitalHuman = null;
let glmAI = null;
let chatHistory = [];
let isProcessing = false;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initConfigPage();
    initHall();
    console.log('页面初始化完成');
});

// ==================== 密钥配置页面逻辑 ====================

/**
 * 初始化配置页面
 */
function initConfigPage() {
    updateKeyTypeDisplay();
    
    // 检查是否已有API KEY
    const apiKey = storage.getApiKey();
    if (apiKey) {
        document.getElementById('api-key').value = apiKey;
    }
}

/**
 * 更新密钥类型显示
 */
function updateKeyTypeDisplay() {
    const keyTypeElement = document.getElementById('key-type');
    const displayText = storage.getKeyTypeDisplayText();
    keyTypeElement.textContent = displayText;
    
    // 根据类型设置颜色
    if (displayText === '未设置') {
        keyTypeElement.style.color = '#999';
    } else if (displayText === '内置测试密钥') {
        keyTypeElement.style.color = '#FF9800';
    } else {
        keyTypeElement.style.color = '#4CAF50';
    }
}

/**
 * 切换密码显示/隐藏
 */
function togglePassword() {
    const input = document.getElementById('api-key');
    const button = document.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

/**
 * 使用测试密钥
 */
function useTestKey() {
    const testKey = CONFIG.glm.testApiKey;
    storage.saveApiKey(testKey, 'test');
    document.getElementById('api-key').value = testKey;
    updateKeyTypeDisplay();
    alert('✅ 已使用内置测试密钥');
}

/**
 * 保存自定义密钥
 */
function saveCustomKey() {
    const apiKey = document.getElementById('api-key').value.trim();
    
    if (!apiKey) {
        alert('❌ 请输入API密钥');
        return;
    }
    
    if (!apiKey.includes('.')) {
        alert('❌ API密钥格式不正确，应包含点号');
        return;
    }
    
    storage.saveApiKey(apiKey, 'custom');
    updateKeyTypeDisplay();
    alert('✅ 自定义密钥已保存');
}

/**
 * 清除密钥
 */
function clearKey() {
    if (confirm('确定要清除API密钥吗？')) {
        storage.clearApiKey();
        document.getElementById('api-key').value = '';
        updateKeyTypeDisplay();
        alert('✅ 密钥已清除');
    }
}

/**
 * 切换标签页
 * @param {string} tabId - 标签ID (chat, faq, education, settings)
 */
function switchTab(tabId) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${tabId}'`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update contents
    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === `tab-${tabId}`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

/**
 * 教育内容展示
 */
function showEducationContent(type) {
    // Switch to chat tab to show response
    switchTab('chat');
    
    const contentMap = {
        'mental-health': '心理健康是幸福生活的基础。保持良好的心理健康需要：1. 保持积极乐观的心态；2. 学会管理情绪；3. 建立良好的人际关系；4. 保持规律的作息；5. 适当运动放松。',
        'anti-bullying': '预防校园霸凌需要我们共同努力：1. 了解霸凌的类型和危害；2. 学会保护自己；3. 遇到霸凌要勇敢说"不"；4. 及时向老师和家长寻求帮助；5. 不做霸凌者，也不做旁观者。',
        'emotion': '情绪管理的实用技巧：1. 深呼吸法，帮助平复情绪；2. 暂时离开情绪场景；3. 向信任的人倾诉；4. 写日记记录情绪；5. 培养兴趣爱好转移注意力。',
        'help': '遇到困难时的求助步骤：1. 识别问题的严重性；2. 寻找合适的求助对象（家长、老师、心理老师）；3. 清楚表达自己的困扰；4. 虚心接受建议；5. 记住求助是勇气的表现。'
    };
    
    const message = contentMap[type] || '暂无相关内容';
    addMessageToChat('assistant', message);
    
    if (digitalHuman.getIsConnected()) {
        digitalHuman.speak(message);
    }
}

/**
 * 保存自定义密钥
 */
function saveCustomKey() {
    const apiKey = document.getElementById('api-key').value.trim();
    
    if (!apiKey) {
        alert('❌ 请输入API密钥');
        return;
    }
    
    if (!apiKey.includes('.')) {
        alert('❌ API密钥格式不正确，应包含点号');
        return;
    }
    
    storage.saveApiKey(apiKey, 'custom');
    updateKeyTypeDisplay();
    alert('✅ 自定义密钥已保存');
}

/**
 * 清除密钥
 */
function clearKey() {
    if (confirm('确定要清除API密钥吗？')) {
        storage.clearApiKey();
        document.getElementById('api-key').value = '';
        updateKeyTypeDisplay();
        alert('✅ 密钥已清除');
    }
}

// ==================== 展厅主界面逻辑 ====================

/**
 * 初始化展厅
 */
function initHall() {
    console.log('开始初始化数字人...');
    
    // 等待SDK加载完成
    const checkSDK = setInterval(() => {
        if (typeof XmovAvatar !== 'undefined') {
            clearInterval(checkSDK);
            console.log('SDK已加载');
            
            try {
                // 初始化GLM AI
                const apiKey = storage.getApiKey();
                glmAI = new GLMAIManager(apiKey);
                
                // 初始化数字人
                digitalHuman = new DigitalHumanManager({
                    appId: CONFIG.digitalHuman.appId,
                    appSecret: CONFIG.digitalHuman.appSecret,
                    gatewayServer: CONFIG.digitalHuman.gatewayServer,
                    containerId: CONFIG.digitalHuman.containerId,
                    avatarId: CONFIG.digitalHuman.avatarId,
                    avatarCode: CONFIG.digitalHuman.avatarCode,
                    onConnect: () => onDigitalHumanConnect(),
                    onDisconnect: () => onDigitalHumanDisconnect(),
                    onStateChange: (state) => onDigitalHumanStateChange(state),
                    onMessage: (message) => console.log('数字人消息:', message),
                    onError: (error) => onDigitalHumanError(error)
                });
                
                // 初始化SDK
                const initSuccess = digitalHuman.init();
                if (!initSuccess) {
                    console.error('数字人SDK初始化失败');
                    alert('❌ 数字人SDK初始化失败');
                    return;
                }
                
                console.log('数字人SDK初始化成功，等待连接...');
                
                // 加载预置问题
                loadPresetQuestions();
                
                // 加载对话历史
                loadChatHistory();
                
                // 绑定回车发送事件
                const userInput = document.getElementById('user-input');
                if (userInput) {
                    userInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    });
                }
                
            } catch (error) {
                console.error('初始化数字人失败:', error);
                alert('❌ 初始化数字人失败: ' + error.message);
            }
        }
    }, 100);
    
    // 10秒后停止检查
    setTimeout(() => {
        clearInterval(checkSDK);
        if (typeof XmovAvatar === 'undefined') {
            console.error('SDK加载超时');
            alert('❌ 数字人SDK加载超时，请检查网络连接后刷新页面');
        }
    }, 10000);
}

/**
 * 加载预置问题
 */
function loadPresetQuestions() {
    const grid = document.getElementById('questions-grid');
    grid.innerHTML = '';
    
    CONFIG.presetQuestions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card bg-gradient-to-br from-gray-50 to-sky-50 p-4 rounded-xl border border-gray-100';
        card.innerHTML = `
            <div class="flex items-start space-x-3">
                <span class="text-2xl">${q.icon}</span>
                <div>
                    <p class="text-sm font-medium text-gray-800">${q.question}</p>
                    <span class="text-xs text-teal-600 mt-1 inline-block">${getCategoryName(q.category)}</span>
                </div>
            </div>
        `;
        card.onclick = () => askPresetQuestion(q.question);
        grid.appendChild(card);
    });
}

/**
 * 获取分类名称
 */
function getCategoryName(category) {
    const names = {
        'bullying': '防校园霸凌',
        'psychology': '心理咨询',
        'study': '学习压力',
        'social': '人际交往'
    };
    return names[category] || '其他';
}

/**
 * 选择分类
 */
function selectCategory(category) {
    // 更新按钮样式
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-teal-100', 'text-teal-700');
        btn.classList.add('bg-gray-100', 'text-gray-600');
    });
    event.target.classList.remove('bg-gray-100', 'text-gray-600');
    event.target.classList.add('bg-teal-100', 'text-teal-700');
    
    // 筛选问题
    const grid = document.getElementById('questions-grid');
    grid.innerHTML = '';
    
    const filteredQuestions = category === 'all' 
        ? CONFIG.presetQuestions 
        : CONFIG.presetQuestions.filter(q => q.category === category);
    
    filteredQuestions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card bg-gradient-to-br from-gray-50 to-sky-50 p-4 rounded-xl border border-gray-100';
        card.innerHTML = `
            <div class="flex items-start space-x-3">
                <span class="text-2xl">${q.icon}</span>
                <div>
                    <p class="text-sm font-medium text-gray-800">${q.question}</p>
                    <span class="text-xs text-teal-600 mt-1 inline-block">${getCategoryName(q.category)}</span>
                </div>
            </div>
        `;
        card.onclick = () => askPresetQuestion(q.question);
        grid.appendChild(card);
    });
}

/**
 * 加载对话历史
 */
function loadChatHistory() {
    chatHistory = storage.getChatHistory();
}

/**
 * 询问预置问题
 * @param {string} question - 问题
 */
function askPresetQuestion(question) {
    switchTab('chat');
    document.getElementById('user-input').value = question;
    sendMessage();
}

// ==================== 数字人控制逻辑 ====================

/**
 * 切换连接状态
 */
function toggleConnection() {
    console.log('toggleConnection 被调用');
    
    // 检查digitalHuman是否已初始化
    if (!digitalHuman) {
        console.error('digitalHuman 未初始化');
        alert('❌ 数字人未初始化，请刷新页面');
        return;
    }
    
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    
    if (!connectBtn || !disconnectBtn) {
        console.error('按钮元素未找到');
        return;
    }
    
    const isConnected = digitalHuman.getIsConnected();
    console.log('当前连接状态:', isConnected);
    
    if (isConnected) {
        // 断开连接
        console.log('执行断开连接...');
        try {
            digitalHuman.disconnect();
            
            // 更新连接按钮状态
            connectBtn.textContent = '🔌 连接数字人';
            connectBtn.classList.remove('from-red-400', 'to-orange-500');
            connectBtn.classList.add('from-sky-400', 'to-teal-500');
            connectBtn.disabled = false;
            
            // 禁用断开连接按钮
            disconnectBtn.disabled = true;
            
            // 显示离线状态
            const offlineState = document.getElementById('offlineState');
            if (offlineState) {
                offlineState.style.display = 'flex';
            }
            
            updateConnectionStatus('offline');
            console.log('断开连接完成');
        } catch (error) {
            console.error('断开连接失败:', error);
            alert('❌ 断开连接失败: ' + error.message);
        }
    } else {
        // 连接
        console.log('执行连接...');
        try {
            connectBtn.textContent = '⏳ 连接中...';
            connectBtn.disabled = true;
            
            const offlineState = document.getElementById('offlineState');
            const loadingState = document.getElementById('loadingState');
            
            if (offlineState) {
                offlineState.style.display = 'none';
            }
            if (loadingState) {
                loadingState.style.display = 'flex';
            }
            
            digitalHuman.connect((progress) => {
                console.log('连接进度:', progress);
                const progressBar = document.getElementById('loadingProgress');
                const percentage = document.getElementById('loadingPercentage');
                
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
                if (percentage) {
                    percentage.textContent = Math.round(progress) + '%';
                }
                
                if (progress === 100 && loadingState) {
                    loadingState.style.display = 'none';
                }
            });
        } catch (error) {
            console.error('连接失败:', error);
            alert('❌ 连接失败: ' + error.message);
            connectBtn.textContent = '🔌 连接数字人';
            connectBtn.disabled = false;
        }
    }
}

/**
 * 处理回车键
 */
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

/**
 * 数字人连接成功回调
 */
function onDigitalHumanConnect() {
    console.log('数字人已连接');
    
    hideLoading();
    updateConnectionStatus('online');
    
    // 更新按钮状态
    const btn = document.getElementById('connectBtn');
    btn.textContent = '⏹️ 断开连接';
    btn.classList.remove('from-sky-400', 'to-teal-500');
    btn.classList.add('from-red-400', 'to-orange-500');
    btn.disabled = false;
    
    document.getElementById('disconnectBtn').disabled = false;
    
    // 隐藏所有状态层（关键！）
    const loadingState = document.getElementById('loadingState');
    const offlineState = document.getElementById('offlineState');
    
    if (loadingState) {
        loadingState.style.display = 'none';
        console.log('已隐藏loadingState');
    }
    if (offlineState) {
        offlineState.style.display = 'none';
        console.log('已隐藏offlineState');
    }
    
    // 连接成功后，让数字人问候
    setTimeout(() => {
        // 关闭SDK自带的调试/字幕信息，避免数字人背后出现文本
        if (digitalHuman && typeof digitalHuman.hideDebugInfo === 'function') {
            digitalHuman.hideDebugInfo();
        }
        digitalHuman.listen();
        setTimeout(() => {
            processAIResponse('你好，我是心语守护者！我是校园心理健康教育专家，可以帮助你解决校园生活中的心理问题，包括防霸凌、情绪管理、学习压力等。有什么我可以帮助你的吗？');
        }, 1000);
    }, 500);
}

/**
 * 数字人断开连接回调
 */
function onDigitalHumanDisconnect() {
    console.log('数字人已断开');
    updateConnectionStatus('offline');
    
    // 显示离线状态
    document.getElementById('offlineState').style.display = 'flex';
    
    // 更新按钮
    const btn = document.getElementById('connectBtn');
    btn.textContent = '🔌 连接数字人';
    btn.classList.remove('from-red-400', 'to-orange-500');
    btn.classList.add('from-sky-400', 'to-teal-500');
    btn.disabled = false;
    
    document.getElementById('disconnectBtn').disabled = true;
}

/**
 * 数字人状态变化回调
 * @param {string} state - 状态
 */
function onDigitalHumanStateChange(state) {
    console.log('数字人状态:', state);
    
    if (state === 'speaking') {
        updateConnectionStatus('speaking');
    } else {
        updateConnectionStatus('online');
    }
}

/**
 * 数字人错误回调
 * @param {Error} error - 错误对象
 */
function onDigitalHumanError(error) {
    console.error('数字人错误:', error);
    alert('❌ 数字人发生错误: ' + error.message);
}

/**
 * 更新连接状态显示
 * @param {string} status - 状态（'online', 'offline', 'speaking'）
 */
function updateConnectionStatus(status) {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');
    
    indicator.classList.remove('status-online', 'status-offline');
    
    if (status === 'online') {
        indicator.classList.add('status-online');
        text.textContent = '在线';
    } else if (status === 'speaking') {
        indicator.classList.add('status-online');
        text.textContent = '说话中';
    } else {
        indicator.classList.add('status-offline');
        text.textContent = '离线';
    }
}

// ==================== 对话逻辑 ====================

/**
 * 发送消息
 */
async function sendMessage() {
    if (isProcessing) {
        alert('⏳ 正在处理中，请稍候...');
        return;
    }
    
    const input = document.getElementById('user-input');
    const question = input.value.trim();
    
    if (!question) {
        alert('❌ 请输入问题');
        return;
    }
    
    // 检查API KEY
    const apiKey = storage.getApiKey();
    if (!apiKey) {
        alert('❌ API密钥未设置，请先配置');
        return;
    }
    
    // 添加用户消息
    addMessageToChat('user', question);
    chatHistory.push({ role: 'user', content: question });
    
    // 清空输入框
    input.value = '';
    
    // 开始处理
    isProcessing = true;
    updateSendButtonState();
    
    // 数字人进入思考状态
    if (digitalHuman.getIsConnected()) {
        digitalHuman.think();
    }
    
    try {
        showLoading('AI思考中...');
        
        let response = '';
        
        if (digitalHuman.getIsConnected()) {
            // 先创建一个空的assistant消息
            addMessageToChat('assistant', '');
            
            // 流式响应
            response = await glmAI.askQuestion(
                question,
                CONFIG.systemPrompt,
                chatHistory.slice(1, -1), // 排除第一条系统消息
                (chunk, full) => {
                    // 显示流式响应
                    updateAssistantMessage(full);
                }
            );
            
            // 隐藏loading
            hideLoading();
            
            // 让数字人说话
            if (digitalHuman.getIsConnected()) {
                digitalHuman.listen(); // 先进入倾听状态
                await new Promise(resolve => setTimeout(resolve, 300)); // 等待状态切换
                digitalHuman.speak(response, true, true); // 开始说话
            }
        } else {
            // 非流式响应
            response = await glmAI.askQuestion(question, CONFIG.systemPrompt, chatHistory.slice(1, -1));
            addMessageToChat('assistant', response);
        }
        
        // 添加到历史
        chatHistory.push({ role: 'assistant', content: response });
        
        // 限制历史长度
        if (chatHistory.length > CONFIG.maxHistoryRounds * 2 + 1) {
            chatHistory = [chatHistory[0], ...chatHistory.slice(-CONFIG.maxHistoryRounds * 2)];
        }
        
        // 保存历史
        storage.saveChatHistory(chatHistory);
        
    } catch (error) {
        console.error('AI调用失败:', error);
        addMessageToChat('assistant', '❌ 抱歉，我遇到了一些问题：' + error.message);
    } finally {
        hideLoading();
        isProcessing = false;
        updateSendButtonState();
    }
}

/**
 * 处理AI响应并让数字人说话
 * @param {string} response - AI响应内容
 */
function processAIResponse(response) {
    // 添加到对话历史
    addMessageToChat('assistant', response);
    
    // 让数字人说话
    if (digitalHuman.getIsConnected()) {
        digitalHuman.speak(response);
    }
    
    // 更新历史
    chatHistory.push({ role: 'assistant', content: response });
    storage.saveChatHistory(chatHistory);
}

/**
 * 添加消息到对话区域
 * @param {string} type - 消息类型（'user', 'assistant', 'system'）
 * @param {string} content - 消息内容
 */
function addMessageToChat(type, content) {
    const container = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message p-4 max-w-[80%] ml-auto' : 'ai-message p-4 max-w-[80%]';
    
    messageDiv.innerHTML = `<p class="text-sm whitespace-pre-wrap">${content}</p>`;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

/**
 * 更新助手消息（用于流式响应）
 * @param {string} content - 消息内容
 */
function updateAssistantMessage(content) {
    let lastMessage = document.querySelector('.ai-message:last-child');
    
    if (!lastMessage) {
        addMessageToChat('assistant', content);
    } else {
        const p = lastMessage.querySelector('p');
        if (p) {
            p.textContent = content;
        }
    }
    
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}

/**
 * 更新发送按钮状态
 */
function updateSendButtonState() {
    const buttons = document.querySelectorAll('button[onclick="sendMessage()"]');
    buttons.forEach(btn => {
        btn.disabled = isProcessing;
        btn.textContent = isProcessing ? '⏳ 发送中...' : '发送';
    });
}

// ==================== 工具函数 ====================

/**
 * 显示加载遮罩
 * @param {string} text - 加载文本
 */
function showLoading(text = '加载中...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-overlay-text');
    loadingText.textContent = text;
    overlay.style.display = 'flex';
}

/**
 * 隐藏加载遮罩
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
}

// 页面卸载时断开数字人连接
window.addEventListener('beforeunload', () => {
    if (digitalHuman && digitalHuman.getIsConnected()) {
        digitalHuman.disconnect();
    }
});
