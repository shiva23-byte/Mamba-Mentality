const axios = require('axios');

async function test() {
  const url = `https://mamba-mentality-ume4.vercel.app/api/activities/range/2026-06-05/2026-06-05`;
  
  console.log('Sending GET request to:', url);
  try {
    const res = await axios.get(url);
    console.log('GET Succeeded!');
    console.log('Response Status:', res.status);
    console.log('Data Length:', res.data.length);
  } catch (err) {
    console.error('GET Failed!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

test();
