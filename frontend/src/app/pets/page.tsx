import { PetList } from '@/components/pet/PetList';

export default function PetsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">我的宠物</h1>
      </div>
      <PetList />
    </div>
  );
}
