const axios = require('axios')
require('dotenv').config()

const API_KEY = process.env.DEEPSEEK_API_KEY
const API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

// 调用Deepseek API进行对话
async function chatCompletion(messages) {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('AI调用失败:', error.message)
    if (error.response) {
      console.error('API错误:', error.response.data)
    }
    throw new Error('AI服务调用失败: ' + error.message)
  }
}

// 生成对话摘要
async function generateSummary(messages) {
  try {
    const summaryPrompt = `
请对以下AI对话内容进行一句话摘要（不超过30字），概括对话的核心主题：

${messages.map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`).join('\n')}

摘要：`;

    const response = await axios.post(
      API_URL,
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: summaryPrompt }],
        temperature: 0.5,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error('生成摘要失败:', error.message)
    return '对话摘要'
  }
}

module.exports = {
  chatCompletion,
  generateSummary
}