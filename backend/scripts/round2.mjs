const FE = 'https://frontend-production-ae85.up.railway.app';
const BASE = 'https://backend-production-7608.up.railway.app/api/v1';

async function main() {
  let pass = 0, fail = 0;
  const results = [];

  async function check(name, fn) {
    try { const ok = await fn(); if (ok) { pass++; results.push(['✅', name]); } else { fail++; results.push(['❌', name]); } }
    catch(e) { fail++; results.push(['❌', name, e.message]); }
  }

  // Manifest
  await check('PWA Manifest', async () => {
    const r = await fetch(FE+'/manifest.json');
    const d = await r.json();
    return d.name && d.short_name && d.icons?.length >= 2;
  });

  // Frontend HTML
  await check('Homepage HTML', async () => {
    const r = await fetch(FE);
    const html = await r.text();
    return html.includes('PetHub') && html.includes('manifest.json');
  });

  // Empty search
  await check('Empty Search', async () => {
    const r = await fetch(BASE+'/search?q=');
    const d = await r.json();
    return d.code === 0;
  });

  // Categories count
  await check('Categories 7', async () => {
    const r = await fetch(BASE+'/categories');
    const d = await r.json();
    return d.data.length === 7;
  });

  // All feeds have images
  let allHaveImages = true;
  await check('Feeds have images', async () => {
    const r = await fetch(BASE+'/feeds?pageSize=50');
    const d = await r.json();
    for (const f of d.data.data) {
      if (!f.images?.length) { allHaveImages = false; break; }
    }
    return allHaveImages;
  });

  // Like with non-existent feed
  await check('Like non-existent feed returns error', async () => {
    const r = await fetch(BASE+'/feeds/99999/like', { method:'POST', headers: { 'Authorization': 'Bearer '+process.env.TOKEN } });
    const d = await r.json();
    return d.code !== 0; // should fail
  });

  // Pin toggle
  await check('Pin toggle', async () => {
    const feeds = await fetch(BASE+'/feeds?pageSize=1').then(r=>r.json());
    const fid = feeds.data.data[0]?.id;
    if (!fid) return false;
    const r = await fetch(BASE+'/feeds/'+fid+'/pin', { method:'POST', headers: { 'Authorization': 'Bearer '+process.env.TOKEN } });
    const d = await r.json();
    return d.code === 0;
  });

  // Featured toggle
  await check('Featured toggle', async () => {
    const feeds = await fetch(BASE+'/feeds?pageSize=1').then(r=>r.json());
    const fid = feeds.data.data[0]?.id;
    if (!fid) return false;
    const r = await fetch(BASE+'/feeds/'+fid+'/featured', { method:'POST', headers: { 'Authorization': 'Bearer '+process.env.TOKEN } });
    const d = await r.json();
    return d.code === 0;
  });

  console.log('\n=== Round 2 Results ===');
  results.forEach(r => console.log(r[0]+' '+r[1]+(r[2]?' ('+r[2]+')':'')));
  console.log('Pass: '+pass+'/'+(pass+fail)+' Fail: '+fail);
  process.exit(fail > 0 ? 1 : 0);
}

main();
