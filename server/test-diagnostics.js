const axios = require('axios');

async function test() {
  const url = `https://mamba-mentality-ume4.vercel.app/api/activities/range/2026-06-03/2026-06-03`;
  console.log('Fetching:', url);
  try {
    const res = await axios.get(url);
    console.log('Success!', res.data);
  } catch (err) {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', JSON.stringify(err.response?.data, null, 2));
  }
}
test();
