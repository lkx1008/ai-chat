// src/types/vue-virtual-scroller.d.ts
declare module 'vue-virtual-scroller' {
  import type { Plugin } from 'vue'
  const VueVirtualScroller: Plugin
  export default VueVirtualScroller
  export const DynamicScroller: any
  export const DynamicScrollerItem: any
  export const RecycleScroller: any
}