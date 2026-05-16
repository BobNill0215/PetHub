const BASE = 'https://backend-production-7608.up.railway.app/api/v1';
const FE = 'https://frontend-production-ae85.up.railway.app';
const T = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksInV1aWQiOiJjbXA2OHFiazAwMDAwcngwcDQ3Mm1uZjJqIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3Nzg4MDg2MzAsImV4cCI6MTc3OTQxMzQzMH0.na7c-q7dKdHnCkuGm6x7EN3Uockd3QlN4qnSis9QnPM';

let pass = 0, fail = 0;
async function t(name, fn) {
  try { const r = await fn(); if (r) { pass++; process.stdout.write('.'); } else { fail++; process.stdout.write('x'); } }
  catch(e) { fail++; process.stdout.write('E'); }
}

(async () => {
  const feeds = await fetch(BASE+'/feeds?pageSize=1').then(r=>r.json());
  const fid = feeds.data.data[0]?.id || 85;
  const h = { 'Authorization': 'Bearer '+T };
  const j = { ...h, 'Content-Type': 'application/json' };

  await t('Health', async () => (await fetch(BASE+'/health').then(r=>r.json())).code===0);
  await t('Login', async () => (await fetch(BASE+'/auth/login',{method:'POST',headers:j,body:'{"email":"new@test.com","password":"pass123"}'}).then(r=>r.json())).code===0);
  await t('Register', async () => (await fetch(BASE+'/auth/register',{method:'POST',headers:j,body:'{"email":"z@z.com","password":"123456","nickname":"Z"}'}).then(r=>r.json())).code===0);
  await t('Profile', async () => (await fetch(BASE+'/users/9').then(r=>r.json())).code===0);
  await t('Stats', async () => (await fetch(BASE+'/users/9/stats').then(r=>r.json())).code===0);
  await t('Feed Detail', async () => (await fetch(BASE+'/feeds/'+fid).then(r=>r.json())).code===0);
  await t('Feed Create', async () => (await fetch(BASE+'/feeds',{method:'POST',headers:j,body:'{"content":"Test","category":"general","images":[],"topics":["test"]}'}).then(r=>r.json())).code===0);
  await t('Feeds List', async () => (await fetch(BASE+'/feeds').then(r=>r.json())).code===0);
  await t('Related', async () => (await fetch(BASE+'/feeds/'+fid+'/related').then(r=>r.json())).code===0);
  await t('Like', async () => (await fetch(BASE+'/feeds/'+fid+'/like',{method:'POST',headers:h}).then(r=>r.json())).code===0);
  await t('Unlike', async () => (await fetch(BASE+'/feeds/'+fid+'/like',{method:'DELETE',headers:h}).then(r=>r.json())).code===0);
  await t('Bookmark', async () => (await fetch(BASE+'/feeds/'+fid+'/bookmark',{method:'POST',headers:h}).then(r=>r.json())).code===0);
  await t('Following Feed', async () => (await fetch(BASE+'/feeds/following',{headers:h}).then(r=>r.json())).code===0);
  await t('Comment', async () => (await fetch(BASE+'/feeds/'+fid+'/comments',{method:'POST',headers:j,body:'{"content":"t"}'}).then(r=>r.json())).code===0);
  await t('Categories', async () => (await fetch(BASE+'/categories').then(r=>r.json())).code===0);
  await t('Featured', async () => (await fetch(BASE+'/feeds/featured').then(r=>r.json())).code===0);
  await t('Search', async () => (await fetch(BASE+'/search?q=cat').then(r=>r.json())).code===0);
  await t('Notifs', async () => (await fetch(BASE+'/notifications',{headers:h}).then(r=>r.json())).code===0);
  await t('Notif Settings', async () => (await fetch(BASE+'/settings/notifications',{headers:h}).then(r=>r.json())).code===0);
  await t('Conversations', async () => (await fetch(BASE+'/conversations',{headers:h}).then(r=>r.json())).code===0);
  await t('Products List', async () => (await fetch(BASE+'/products').then(r=>r.json())).code===0);
  await t('Followers', async () => (await fetch(BASE+'/users/9/followers').then(r=>r.json())).code===0);
  await t('Following', async () => (await fetch(BASE+'/users/9/following').then(r=>r.json())).code===0);
  await t('Points', async () => (await fetch(BASE+'/users/me/points',{headers:h}).then(r=>r.json())).code===0);
  await t('Update Notif Settings', async () => (await fetch(BASE+'/settings/notifications',{method:'PUT',headers:j,body:'{"onLike":true}'}).then(r=>r.json())).code===0);

  // Frontend
  for (const p of ['/','/feed','/login','/register','/marketplace','/search','/post/'+fid,'/user/12','/settings','/notifications','/messages','/profile']) {
    await t('FE: '+p, async () => (await fetch(FE+p)).ok);
  }

  process.stdout.write('\n');
  console.log('Pass: '+pass+'/'+(pass+fail)+' Fail: '+fail);
  process.exit(fail > 0 ? 1 : 0);
})();
