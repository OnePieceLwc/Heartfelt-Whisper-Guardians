// 项目配置文件
const CONFIG = {
    // 数字人配置
    digitalHuman: {
        appId: '920d4c7e5594469ea676687bcb9b6903',
        appSecret: 'dff1f1df481a42658bf024ef016c8b41',
        gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
        containerId: '#avatar-container',
        avatarId: 'xmov_avatar_001',
        avatarCode: 'xmov_avatar_001'
    },
    
    // GLM API配置
    glm: {
        apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'glm-4',
        testApiKey: '0aa386eda7cc440e9a0c1229102bda26.znf7Y3nRB9QxqKol'
    },
    
    // 预置问题列表
    presetQuestions: [
        {
            id: 1,
            question: '什么是校园霸凌？有哪些类型？',
            icon: '🛡️',
            category: 'bullying'
        },
        {
            id: 2,
            question: '如果我发现同学被霸凌，应该怎么做？',
            icon: '🤝',
            category: 'bullying'
        },
        {
            id: 3,
            question: '如何避免自己成为霸凌的受害者？',
            icon: '🛡️',
            category: 'bullying'
        },
        {
            id: 4,
            question: '遇到网络霸凌该怎么办？',
            icon: '💻',
            category: 'bullying'
        },
        {
            id: 5,
            question: '如何缓解学习压力？',
            icon: '📚',
            category: 'study'
        },
        {
            id: 6,
            question: '我总是感到焦虑，怎么办？',
            icon: '😰',
            category: 'psychology'
        },
        {
            id: 7,
            question: '如何和同学建立良好的关系？',
            icon: '👥',
            category: 'social'
        },
        {
            id: 8,
            question: '如何提升自己的自信心？',
            icon: '💪',
            category: 'psychology'
        },
        {
            id: 9,
            question: '生气的时候该如何控制情绪？',
            icon: '😠',
            category: 'psychology'
        },
        {
            id: 10,
            question: '遇到挫折时如何调整心态？',
            icon: '🌈',
            category: 'psychology'
        },
        {
            id: 11,
            question: '如何处理和父母的矛盾？',
            icon: '👨‍👩‍👧‍👦',
            category: 'social'
        },
        {
            id: 12,
            question: '感到孤独时该怎么办？',
            icon: '💔',
            category: 'psychology'
        },
        {
            id: 13,
            question: '什么时候应该寻求心理老师的帮助？',
            icon: '🏥',
            category: 'psychology'
        },
        {
            id: 14,
            question: '如何向老师或家长倾诉心事？',
            icon: '🗣️',
            category: 'social'
        },
        {
            id: 15,
            question: '我想帮助有心理困扰的同学，怎么做才合适？',
            icon: '❤️',
            category: 'social'
        },
        {
            id: 16,
            question: '如何正确处理同学之间的矛盾？',
            icon: '🤝',
            category: 'social'
        }
    ],
    
    // 系统提示词
    systemPrompt: `你是校园心理健康教育专家"心语老师"，专业、温暖、富有同理心。

【角色定位】
- 具有心理学专业背景的校园心理老师
- 熟悉青少年心理发展特点
- 了解校园霸凌的预防和干预
- 擅长心理健康教育和辅导

【服务宗旨】
- 为学生提供心理健康支持
- 帮助识别和应对校园霸凌
- 提供情绪疏导和行为指导
- 培养健康的人际关系

【专业领域】
1. 校园霸凌预防与应对
   - 认识霸凌的类型（言语、身体、网络、关系）
   - 如何自我保护
   - 如何帮助被霸凌的同学
   - 如何正确报告霸凌事件

2. 心理健康教育
   - 情绪管理与调节
   - 压力应对策略
   - 人际交往技巧
   - 自信心的建立

3. 危机识别与干预
   - 心理危机的早期识别
   - 自杀意念的应对
   - 严重心理问题的转介建议

【回答风格】
- 温暖亲切，富有同理心
- 语言简洁，通俗易懂
- 积极正向，给予希望
- 尊重隐私，保护学生

【注意事项】
- 识别严重风险（自杀、自残、严重霸凌），及时建议寻求专业帮助
- 不做心理诊断，提供普及性建议
- 强调寻求帮助是勇气的表现
- 保护学生隐私和尊严
- 回答长度控制在200-300字以内`,
    
    // 对话历史最大轮数
    maxHistoryRounds: 5,
    
    // UI配置
    ui: {
        typingSpeed: 50, // 打字效果速度（毫秒）
        loadingDelay: 500 // 加载延迟（毫秒）
    }
};
