// GLM AI接口封装模块
class GLMAIManager {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        this.model = 'glm-4';
    }
    
    /**
     * 设置API密钥
     * @param {string} apiKey - API密钥
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    
    /**
     * 发送消息（非流式）
     * @param {Array} messages - 消息数组
     * @returns {Promise<string>} 响应内容
     */
    async sendMessage(messages) {
        if (!this.apiKey) {
            throw new Error('API密钥未设置');
        }
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || '请求失败');
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('GLM API调用失败:', error);
            throw error;
        }
    }
    
    /**
     * 发送消息（流式）
     * @param {Array} messages - 消息数组
     * @param {Function} onChunk - 流式回调函数
     * @returns {Promise<string>} 完整响应内容
     */
    async sendMessageStream(messages, onChunk) {
        if (!this.apiKey) {
            throw new Error('API密钥未设置');
        }
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: true
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || '请求失败');
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        
                        if (data === '[DONE]') {
                            continue;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            
                            if (content) {
                                fullContent += content;
                                if (onChunk) {
                                    onChunk(content, fullContent);
                                }
                            }
                        } catch (e) {
                            console.error('解析流式响应失败:', e);
                        }
                    }
                }
            }
            
            return fullContent;
        } catch (error) {
            console.error('GLM流式API调用失败:', error);
            throw error;
        }
    }
    
    /**
     * 问答接口
     * @param {string} question - 用户问题
     * @param {string} systemPrompt - 系统提示词
     * @param {Array} history - 对话历史
     * @param {Function} onChunk - 流式回调
     * @returns {Promise<string>} 回答
     */
    async askQuestion(question, systemPrompt, history = [], onChunk) {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: question }
        ];
        
        if (onChunk) {
            return await this.sendMessageStream(messages, onChunk);
        } else {
            return await this.sendMessage(messages);
        }
    }
    
    /**
     * 测试API密钥
     * @returns {Promise<boolean>} 是否有效
     */
    async testApiKey() {
        try {
            const response = await this.sendMessage([
                { role: 'system', content: '你是一个测试助手' },
                { role: 'user', content: '你好' }
            ]);
            return !!response;
        } catch (error) {
            console.error('API密钥测试失败:', error);
            return false;
        }
    }
}
