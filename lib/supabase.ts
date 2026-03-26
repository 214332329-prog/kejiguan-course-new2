/**
 * Supabase 配置
 * 用于创建 Supabase 客户端实例
 */
import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 项目 URL
 * 从环境变量获取，默认使用开发环境的 URL
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddxgwajcmxwiqsemnsup.supabase.co'

/**
 * Supabase 匿名访问密钥
 * 从环境变量获取，默认使用开发环境的密钥
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_G8i8AjnR0marBlozuELqrw_WC3NffAS'

/**
 * Supabase 客户端实例
 * 用于与 Supabase 数据库进行交互
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)