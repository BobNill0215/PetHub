const BASE = 'https://backend-production-7608.up.railway.app/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJ1dWlkIjoiY21wODd4aHB1MDAwMGt6MXp3MzV6eW9oNyIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzc4OTI4MjE3LCJleHAiOjE3Nzk1MzMwMTd9.dSjYC-hKelTcoOfLN6wsJ9hB-ttJq-OaErRWhp6mAs0';

const IMG = {
  cat: ['https://picsum.photos/seed/kitty1/600/400','https://picsum.photos/seed/kitty2/600/400','https://picsum.photos/seed/kitty3/600/400','https://picsum.photos/seed/catnap/600/400','https://picsum.photos/seed/meow/600/400'],
  dog: ['https://picsum.photos/seed/puppy1/600/400','https://picsum.photos/seed/puppy2/600/400','https://picsum.photos/seed/doggo1/600/400','https://picsum.photos/seed/woof/600/400','https://picsum.photos/seed/bark/600/400'],
  smallpet: ['https://picsum.photos/seed/bunny1/600/400','https://picsum.photos/seed/hammy/600/400','https://picsum.photos/seed/guinea/600/400','https://picsum.photos/seed/fluffy1/600/400','https://picsum.photos/seed/little1/600/400'],
  aquatic: ['https://picsum.photos/seed/fishy1/600/400','https://picsum.photos/seed/nemo1/600/400','https://picsum.photos/seed/coralreef/600/400','https://picsum.photos/seed/turtle2/600/400','https://picsum.photos/seed/betta/600/400'],
  reptile: ['https://picsum.photos/seed/lizard2/600/400','https://picsum.photos/seed/snek/600/400','https://picsum.photos/seed/tortoise2/600/400','https://picsum.photos/seed/gecko2/600/400','https://picsum.photos/seed/dragon1/600/400'],
  insect: ['https://picsum.photos/seed/antfarm/600/400','https://picsum.photos/seed/bug1/600/400','https://picsum.photos/seed/praying/600/400','https://picsum.photos/seed/caterpillar/600/400','https://picsum.photos/seed/cricket/600/400'],
  general: ['https://picsum.photos/seed/petlove/600/400','https://picsum.photos/seed/furry/600/400','https://picsum.photos/seed/cuteanimal/600/400','https://picsum.photos/seed/happy1/600/400','https://picsum.photos/seed/sweet1/600/400'],
};

(async () => {
  let page = 1, all = [];
  while (true) {
    const r = await fetch(BASE + '/feeds?page=' + page + '&pageSize=50').then(r => r.json());
    if (!r.data.data.length) break;
    all.push(...r.data.data);
    page++;
  }

  let updated = 0;
  for (const f of all) {
    const imgs = IMG[f.category] || IMG.general;
    const idx = all.indexOf(f) % imgs.length;
    const res = await fetch(BASE + '/feeds/' + f.id + '/images', {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: [imgs[idx]] }),
    });
    const d = await res.json();
    if (d.code === 0) updated++;
    else console.log('  Failed:', f.id, d.message);
  }
  console.log('Updated ' + updated + '/' + all.length + ' posts with images');
})();
