import { AddPetForm } from '@/components/pet/AddPetForm';

export default function AddPetPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">添加宠物</h1>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <AddPetForm />
      </div>
    </div>
  );
}
