const features = [
  {
    icon: '📸',
    title: '萌宠日常',
    desc: '分享宠物照片和短视频，记录毛孩子的每一个可爱瞬间',
  },
  {
    icon: '👥',
    title: '宠物社交',
    desc: '找到同城的宠物伙伴，约遛、聚会、交流养宠心得',
  },
  {
    icon: '🏪',
    title: '宠物商城',
    desc: '买宠物、买用品，担保交易安全放心',
  },
  {
    icon: '📅',
    title: '服务预约',
    desc: '在线预约美容、医疗、寄养等专业宠物服务',
  },
  {
    icon: '💬',
    title: '即时通讯',
    desc: '与宠友私信聊天，随时交流养宠经验',
  },
  {
    icon: '🔍',
    title: '智能推荐',
    desc: '基于你的宠物品种和偏好，推荐感兴趣的内容和商品',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">一站式宠物生活平台</h2>
          <p className="mt-4 text-gray-600">从分享到交易，满足你和宠物的所有需求</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
