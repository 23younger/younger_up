// 1、合并两个有序链表
// 输入 1-2-4，1-3-4
// 输出 1-1-2-3-4-4
// function listNode(val) {
//   this.val = val;
//   this.next = null;
// }
// 递归
function mergeTwoList (l1, l2) {
  if (l1 === null) {
    return l2;
  }
  if (l2 === null) {
    return l1;
  }
  if (l1.val < l2.val) {
    l1.next = mergeTwoList(l1.next, l2)
    return l1;
  } else {
    l2.next = mergeTwoList(l1, l2.next)
    return l2;
  }
}
