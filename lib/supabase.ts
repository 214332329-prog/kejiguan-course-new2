/**
 * Supabase 配置
 * 用于创建 Supabase 客户端实例
 */
import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 项目 URL
 * 从环境变量获取
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

/**
 * Supabase 匿名访问密钥
 * 从环境变量获取
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * 检查环境变量是否配置
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Using mock data.')
}

/**
 * Supabase 客户端实例
 * 用于与 Supabase 数据库进行交互
 */
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({} as any)