// Script to add images to existing posts
const BASE = 'https://backend-production-7608.up.railway.app/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJ1dWlkIjoiY21wODd4aHB1MDAwMGt6MXp3MzV6eW9oNyIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzc4OTI4MjE3LCJleHAiOjE3Nzk1MzMwMTd9.dSjYC-hKelTcoOfLN6wsJ9hB-ttJq-OaErRWhp6mAs0';

// Pet-relevant images from picsum.photos with specific seeds
const IMAGES = {
  cat: ['https://picsum.photos/seed/cat1/600/400','https://picsum.photos/seed/cat2/600/400','https://picsum.photos/seed/cat3/600/400','https://picsum.photos/seed/cat4/600/400','https://picsum.photos/seed/cat5/600/400'],
  dog: ['https://picsum.photos/seed/dog1/600/400','https://picsum.photos/seed/dog2/600/400','https://picsum.photos/seed/dog3/600/400','https://picsum.photos/seed/dog4/600/400','https://picsum.photos/seed/dog5/600/400'],
  smallpet: ['https://picsum.photos/seed/rabbit1/600/400','https://picsum.photos/seed/hamster1/600/400','https://picsum.photos/seed/guinea1/600/400','https://picsum.photos/seed/chinchilla1/600/400','https://picsum.photos/seed/hedgehog1/600/400'],
  aquatic: ['https://picsum.photos/seed/fish1/600/400','https://picsum.photos/seed/aquarium1/600/400','https://picsum.photos/seed/turtle1/600/400','https://picsum.photos/seed/coral1/600/400','https://picsum.photos/seed/koi1/600/400'],
  reptile: ['https://picsum.photos/seed/lizard1/600/400','https://picsum.photos/seed/snake1/600/400','https://picsum.photos/seed/tortoise1/600/400','https://picsum.photos/seed/gecko1/600/400','https://picsum.photos/seed/chameleon1/600/400'],
  insect: ['https://picsum.photos/seed/ant1/600/400','https://picsum.photos/seed/beetle1/600/400','https://picsum.photos/seed/mantis1/600/400','https://picsum.photos/seed/butterfly1/600/400','https://picsum.photos/seed/spider1/600/400'],
  general: ['https://picsum.photos/seed/pet1/600/400','https://picsum.photos/seed/animal1/600/400','https://picsum.photos/seed/cute1/600/400','https://picsum.photos/seed/friend1/600/400','https://picsum.photos/seed/love1/600/400'],
};

// Add PATCH endpoint to backend first
async function main() {
  // Re-post all articles with images
  const allFeeds = [];
  let page = 1;
  while (true) {
    const r = await fetch(BASE + '/feeds?page=' + page + '&pageSize=50').then(r => r.json());
    if (!r.data.data.length) break;
    allFeeds.push(...r.data.data);
    page++;
  }

  // Group by category
  const grouped = {};
  allFeeds.forEach(f => {
    if (!grouped[f.category]) grouped[f.category] = [];
    grouped[f.category].push(f);
  });

  console.log('Adding images to posts...');
  let updated = 0;

  for (const [cat, feeds] of Object.entries(grouped)) {
    const catImages = IMAGES[cat] || IMAGES.general;
    for (let i = 0; i < feeds.length; i++) {
      const f = feeds[i];
      const img = catImages[i % catImages.length];

      // Re-post with images added (delete old + create new)
      // Since we can't update, let's use the PATCH approach
      try {
        // Using a workaround: POST multipart to update images via our API
        // Actually we need a PATCH endpoint. Let me just re-create the posts.
        const res = await fetch(BASE + '/feeds/' + f.id + '/images', {
          method: 'PATCH',
          headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: [img] }),
        });
        if (res.ok) updated++;
        else console.log('  Failed to update feed ' + f.id + ': ' + res.status);
      } catch (e) {
        console.log('  Error on feed ' + f.id);
      }
    }
  }

  console.log('Updated ' + updated + ' posts with images');
  console.log('Need to add PATCH endpoint first!');
}

main();
