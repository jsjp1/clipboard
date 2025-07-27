class Node<T> {
  public next: Node<T> | null = null;
  public prev: Node<T> | null = null;
  
  constructor(public data: T) {}
}

export class LinkedList<T> {
  private head: Node<T> | null = null;

  insertInBegin(data: T): void {
    const node = new Node(data);
    if(!this.head) {
      this.head = node;
    } else {
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    }
  }

  insertAtEnd(data: T): void {
    const node = new Node(data);
    if(!this.head){
      this.head = node;
    } else {
      const getLast = (node: Node<T>): Node<T> => {
        return node.next ? getLast(node.next): node;
      };

      const lastNode = getLast(this.head);
      node.prev = lastNode;
      lastNode.next = node;
    }
  }

  find(data: T): Node<T> | null {
    let current = this.head;

    while (current) {
      if (current.data === data) {
        return current;
      }
      current = current.next;
    }

    return null;
  }

  matchFind(predicate: (data: T) => boolean): Node<T> | null {
    let current = this.head;

    while (current) {
      if (predicate(current.data)) {
        return current;
      }
      current = current.next;
    }

    return null;
  }

  delete(node: Node<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
    if (node === this.head) {
      this.head = node.next;
    }
  }
}