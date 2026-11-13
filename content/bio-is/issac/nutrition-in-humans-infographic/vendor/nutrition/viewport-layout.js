/* One viewport. Only text containers may scroll vertically. */
(() => {
'use strict';
function panelPlan(width,requested,preferred){const order=['model','text','notes','practice'],available=order.filter(k=>requested.includes(k));if(!available.length)available.push('model');const visible=width<760?[available.includes(preferred)?preferred:available[0]]:available;const rows=visible.length===4?2:1,columns=rows===2?2:visible.length;return {visible,rows,columns,weights:visible.length===2&&visible[0]==='model'?[2.2,1]:Array(columns).fill(1)}}
function contain(w,h,sourceW=1120,sourceH=800){const scale=Math.max(0,Math.min(w/sourceW,h/sourceH));return {width:sourceW*scale,height:sourceH*scale,scale}}
function fitScale(w,h,contentW,contentH){return Math.max(0,Math.min(1,w/Math.max(1,contentW),h/Math.max(1,contentH)))}
function pageSlice(items,page,size){const pages=Math.max(1,Math.ceil(items.length/size)),index=Math.max(0,Math.min(pages-1,page));return {items:items.slice(index*size,(index+1)*size),page:index,pages}}
window.ViewportLayout={panelPlan,contain,fitScale,pageSlice};
})();
