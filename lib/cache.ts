/**
 * 内存缓存服务
 * 提供简单的内存缓存功能，支持设置过期时间
 */
class Cache {
  /**
   * 缓存存储
   * key: 缓存键
   * value: { data: 缓存数据, timestamp: 缓存时间戳 }
   */
  private cache: Map<string, { data: any; timestamp: number }>;
  
  /**
   * 缓存过期时间（毫秒）
   */
  private ttl: number;

  /**
   * 构造函数
   * @param ttl 缓存过期时间（毫秒），默认5分钟
   */
  constructor(ttl: number = 5 * 60 * 1000) { // 默认5分钟
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据，如果缓存不存在或已过期则返回null
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在缓存
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
}

/**
 * 缓存服务单例实例
 */
export const cache = new Cache();

/**
 * 生成缓存键
 * @param prefix 缓存键前缀
 * @param args 缓存键参数
 * @returns 生成的缓存键
 */
export const generateCacheKey = (prefix: string, ...args: any[]): string => {
  return `${prefix}:${args.map(arg => JSON.stringify(arg)).join(':')}`;
};
