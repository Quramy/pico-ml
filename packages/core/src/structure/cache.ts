export class LRUCache<K, V> {
  private _cacheMap = new Map<K, V>();

  constructor(private _maxSize: number = 100) {}

  set(key: K, value: V) {
    this._cacheMap.set(key, value);
    if (this._cacheMap.size > this._maxSize) {
      const lru = this._cacheMap.keys().next();
      this._cacheMap.delete(lru.value);
    }
  }

  get(key: K) {
    const result = this._cacheMap.get(key);
    if (!result) return;
    return result;
  }

  has(key: K) {
    return this._cacheMap.has(key);
  }

  touch(key: K) {
    const result = this._cacheMap.get(key);
    if (!result) return;
    this._cacheMap.delete(key);
    this._cacheMap.set(key, result);
  }

  del(key: K) {
    this._cacheMap.delete(key);
  }

  clearAll() {
    this._cacheMap = new Map<K, V>();
  }
}
