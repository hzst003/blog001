'use client';

import { deleteProduct } from '@/app/actions/products';

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!window.confirm('确定删除该商品？此操作不可恢复。')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="ui-btn-danger w-full sm:w-auto">
        删除
      </button>
    </form>
  );
}
