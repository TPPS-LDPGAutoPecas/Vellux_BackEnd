const fetch = require('node-fetch'); // we can just use native fetch in node 18+

async function test() {
  try {
    const res = await fetch("https://vellux-backend.onrender.com/api/appointments/available-slots?date=2026-06-23");
    console.log("STATUS:", res.status);
    const text = await res.text();
    console.log("RESPONSE:", text);
  } catch (err) {
    console.error(err);
  }
}
test();
