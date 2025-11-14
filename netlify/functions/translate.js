const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text } = JSON.parse(event.body || "{}");
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'text is required' }) };
    }

    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: "deepseek-chat",
      messages: [
        { 
          role: "system", 
          content: "你是一个翻译助手。将用户提供的文本从英语或日语翻译成简体中文，不添加额外解释，只返回翻译结果。" 
        },
        { 
          role: "user", 
          content: `请翻译以下内容为简体中文：\n\n${text}` 
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const translation = response.data.choices?.[0]?.message?.content || '';
    return { statusCode: 200, body: JSON.stringify({ translation: translation.trim() }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
