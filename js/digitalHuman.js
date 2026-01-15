// 数字人SDK封装模块
class DigitalHumanManager {
    constructor(options = {}) {
        this.appId = options.appId;
        this.appSecret = options.appSecret;
        this.gatewayServer = options.gatewayServer;
        this.containerId = options.containerId;
        this.avatarId = options.avatarId || 'xmov_avatar_001';
        this.avatarCode = options.avatarCode || 'xmov_avatar_001';
        
        this.sdk = null;
        this.isConnected = false;
        this.isSpeaking = false;
        this.volume = 0.8;
        
        // 回调函数
        this.onConnect = options.onConnect || (() => {});
        this.onDisconnect = options.onDisconnect || (() => {});
        this.onStateChange = options.onStateChange || (() => {});
        this.onMessage = options.onMessage || (() => {});
        this.onError = options.onError || (() => {});
    }
    
    /**
     * 显示/隐藏字幕
     */
    showCaption(text) {
        const el = document.getElementById('avatar-caption');
        if (!el) return;
        el.textContent = text;
        el.style.display = 'block';
    }

    hideCaption() {
        const el = document.getElementById('avatar-caption');
        if (!el) return;
        el.style.display = 'none';
        el.textContent = '';
    }

    /**
     * 初始化SDK
     */
    init() {
        if (typeof XmovAvatar === 'undefined') {
            this.onError(new Error('数字人SDK未加载'));
            return false;
        }
        
        try {
            this.sdk = new XmovAvatar({
                containerId: this.containerId,
                appId: this.appId,
                appSecret: this.appSecret,
                gatewayServer: this.gatewayServer,
                avatarId: this.avatarId,
                avatarCode: this.avatarCode,
                enableLogger: true, // 开启日志用于调试
                onMessage: (message) => {
                    console.log('SDK消息:', message);
                    this.onMessage(message);
                },
                onStateChange: (state) => {
                    console.log('数字人状态变化:', state);
                    this.handleStateChange(state);
                    this.onStateChange(state);
                },
                onVoiceStateChange: (status) => {
                    console.log('语音状态变化:', status);
                    if (status === 'start') {
                        this.isSpeaking = true;
                        // 保持字幕显示，实际文本在 speak/speakStream 中设置
                    } else if (status === 'end') {
                        this.isSpeaking = false;
                        this.hideCaption();
                    }
                },
                onError: (error) => {
                    console.error('SDK错误:', error);
                    this.onError(error);
                }
            });
            
            return true;
        } catch (error) {
            console.error('SDK初始化失败:', error);
            this.onError(error);
            return false;
        }
    }
    
    /**
     * 尝试恢复AudioContext
     */
    resumeAudioContext() {
        if (this.sdk && this.sdk.audioContext && this.sdk.audioContext.state === 'suspended') {
            console.log('Trying to resume AudioContext...');
            this.sdk.audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
            }).catch(err => {
                console.warn('Failed to resume AudioContext:', err);
            });
        }
    }

    /**
     * 连接数字人
     * @param {Function} onProgress - 加载进度回调
     */
    connect(onProgress) {
        if (this.isConnected) {
            console.log('数字人已连接');
            return true;
        }
        
        if (!this.sdk) {
            console.error('SDK实例未创建');
            this.onError(new Error('SDK实例未创建'));
            return false;
        }
        
        try {
            console.log('开始初始化数字人...');
            
            // Add global user interaction listener for audio
            const resumeAudio = () => {
                this.resumeAudioContext();
                // We keep the listener for a while or remove it after success
                // But for simplicity, we try to resume on every click if suspended
            };
            document.addEventListener('click', resumeAudio, { once: true });
            document.addEventListener('touchstart', resumeAudio, { once: true });

            this.sdk.init({
                onDownloadProgress: (progress) => {
                    console.log('资源加载进度:', progress);
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                initModel: 'normal'
            });
            
            // Initial try (might fail if no user interaction yet, but connect() is usually triggered by click)
            setTimeout(() => this.resumeAudioContext(), 100);
            
            // 连接状态将通过onStateChange回调自动更新
            return true;
            
        } catch (error) {
            console.error('初始化数字人失败:', error);
            this.onError(error);
            return false;
        }
    }
    
    /**
     * 断开连接
     */
    disconnect() {
        if (!this.isConnected) {
            console.log('数字人未连接');
            return;
        }
        
        try {
            if (this.sdk) {
                this.sdk.destroy();
                this.sdk = null;
            }
            this.isConnected = false;
            this.isSpeaking = false;
            this.onDisconnect();
        } catch (error) {
            console.error('断开连接失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 处理状态变化
     * @param {string} state - 状态
     */
    handleStateChange(state) {
        console.log('当前状态:', state);
        
        // 当状态变为有效状态时，标记为已连接
        if (state && state !== 'offline' && !this.isConnected) {
            this.isConnected = true;
            this.onConnect();
            this.resumeAudioContext();
        }
        
        // 当状态变为offline时，标记为未连接
        if (state === 'offline' && this.isConnected) {
            this.isConnected = false;
            this.onDisconnect();
        }
    }
    
    /**
     * 驱动数字人说话（非流式）
     * @param {string} text - 要说的文本
     * @param {boolean} interactive - 是否交互模式
     */
    speak(text, interactive = true) {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return false;
        }
        
        try {
            this.showCaption(text);
            this.sdk.speak(text, true, true);
            return true;
        } catch (error) {
            console.error('说话失败:', error);
            this.onError(error);
            return false;
        }
    }
    
    /**
     * 流式驱动数字人说话
     * @param {Array} chunks - 文本分块数组
     */
    async speakStream(chunks) {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return false;
        }
        
        try {
            for (let i = 0; i < chunks.length; i++) {
                const isStart = i === 0;
                const isEnd = i === chunks.length - 1;
                
                // 更新底部字幕为当前语句（简单拼接）
                const currentText = chunks.slice(0, i + 1).join('');
                this.showCaption(currentText);

                this.sdk.speak(chunks[i], isStart, isEnd);
                
                // 等待一小段时间让数字人说完这一段
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return true;
        } catch (error) {
            console.error('流式说话失败:', error);
            this.onError(error);
            return false;
        }
    }
    
    /**
     * 进入待机状态
     */
    idle() {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return;
        }
        
        try {
            this.sdk.idle();
        } catch (error) {
            console.error('进入待机状态失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 进入倾听状态
     */
    listen() {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return;
        }
        
        try {
            this.sdk.listen();
        } catch (error) {
            console.error('进入倾听状态失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 进入思考状态
     */
    think() {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return;
        }
        
        try {
            this.sdk.think();
        } catch (error) {
            console.error('进入思考状态失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 设置音量
     * @param {number} volume - 音量（0-1）
     */
    setVolume(volume) {
        if (volume < 0 || volume > 1) {
            console.warn('音量值必须在0-1之间');
            return;
        }
        
        this.volume = volume;
        
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return;
        }
        
        try {
            this.sdk.setVolume(volume);
        } catch (error) {
            console.error('设置音量失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 显示调试信息
     */
    showDebugInfo() {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return;
        }
        
        try {
            this.sdk.showDebugInfo();
        } catch (error) {
            console.error('显示调试信息失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 隐藏调试信息
     */
    hideDebugInfo() {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return;
        }
        
        try {
            this.sdk.hideDebugInfo();
        } catch (error) {
            console.error('隐藏调试信息失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 切换数字人显隐
     * @param {boolean} visible - 是否可见
     */
    setAvatarVisible(visible) {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return;
        }
        
        try {
            this.sdk.changeAvatarVisible(visible);
        } catch (error) {
            console.error('设置数字人显隐失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 切换隐身模式
     */
    switchInvisibleMode() {
        if (!this.isConnected || !this.sdk) {
            console.warn('数字人未连接');
            return;
        }
        
        try {
            this.sdk.switchInvisibleMode();
        } catch (error) {
            console.error('切换隐身模式失败:', error);
            this.onError(error);
        }
    }
    
    /**
     * 获取连接状态
     * @returns {boolean} 是否已连接
     */
    getIsConnected() {
        return this.isConnected;
    }
    
    /**
     * 获取说话状态
     * @returns {boolean} 是否正在说话
     */
    getIsSpeaking() {
        return this.isSpeaking;
    }
}
