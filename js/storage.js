// localStorage管理模块
class StorageManager {
    constructor() {
        this.apiKeyStorageKey = 'glm_api_key';
        this.apiKeyTypeKey = 'glm_api_key_type';
        this.chatHistoryKey = 'chat_history';
    }
    
    /**
     * 保存GLM API KEY
     * @param {string} apiKey - API密钥
     * @param {string} type - 密钥类型（'test' 或 'custom'）
     */
    saveApiKey(apiKey, type = 'custom') {
        try {
            localStorage.setItem(this.apiKeyStorageKey, apiKey);
            localStorage.setItem(this.apiKeyTypeKey, type);
            return true;
        } catch (error) {
            console.error('保存API KEY失败:', error);
            return false;
        }
    }
    
    /**
     * 获取GLM API KEY
     * @returns {string|null} API密钥
     */
    getApiKey() {
        try {
            return localStorage.getItem(this.apiKeyStorageKey);
        } catch (error) {
            console.error('获取API KEY失败:', error);
            return null;
        }
    }
    
    /**
     * 获取API密钥类型
     * @returns {string} 密钥类型
     */
    getApiKeyType() {
        try {
            const type = localStorage.getItem(this.apiKeyTypeKey);
            return type || 'none';
        } catch (error) {
            console.error('获取API密钥类型失败:', error);
            return 'none';
        }
    }
    
    /**
     * 获取API密钥类型的显示文本
     * @returns {string} 显示文本
     */
    getKeyTypeDisplayText() {
        const type = this.getApiKeyType();
        const texts = {
            'test': '内置测试密钥',
            'custom': '自定义密钥',
            'none': '未设置'
        };
        return texts[type] || '未知';
    }
    
    /**
     * 清除API密钥
     * @returns {boolean} 是否成功
     */
    clearApiKey() {
        try {
            localStorage.removeItem(this.apiKeyStorageKey);
            localStorage.removeItem(this.apiKeyTypeKey);
            return true;
        } catch (error) {
            console.error('清除API KEY失败:', error);
            return false;
        }
    }
    
    /**
     * 保存对话历史
     * @param {Array} messages - 消息数组
     */
    saveChatHistory(messages) {
        try {
            localStorage.setItem(this.chatHistoryKey, JSON.stringify(messages));
            return true;
        } catch (error) {
            console.error('保存对话历史失败:', error);
            return false;
        }
    }
    
    /**
     * 获取对话历史
     * @returns {Array} 消息数组
     */
    getChatHistory() {
        try {
            const data = localStorage.getItem(this.chatHistoryKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('获取对话历史失败:', error);
            return [];
        }
    }
    
    /**
     * 清除对话历史
     * @returns {boolean} 是否成功
     */
    clearChatHistory() {
        try {
            localStorage.removeItem(this.chatHistoryKey);
            return true;
        } catch (error) {
            console.error('清除对话历史失败:', error);
            return false;
        }
    }
    
    /**
     * 清除所有存储数据
     * @returns {boolean} 是否成功
     */
    clearAll() {
        try {
            this.clearApiKey();
            this.clearChatHistory();
            return true;
        } catch (error) {
            console.error('清除所有数据失败:', error);
            return false;
        }
    }
}

// 创建全局实例
const storage = new StorageManager();
