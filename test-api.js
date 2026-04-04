// 简单的API测试脚本
const fetch = require('node-fetch');

async function testAPI() {
  console.log('Testing API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/qwen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: '你好，请简单介绍一下自己'
        }]
      })
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
