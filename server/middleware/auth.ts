import { eventHandler, createError, defineEventHandler } from 'h3';
import { verifyToken } from "../utils/jwt";
import { logger } from "../utils/logger";

// 定义认证用户类型
export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

// 扩展 H3 的 EventContext 类型
declare module 'h3' {
  interface H3EventContext {
    user: AuthUser | null;
  }
}

/**
 * 基础认证中间件
 */
const authMiddleware = defineEventHandler(async (event) => {
  // 初始化用户上下文
  event.context.user = null;
  
  const authHeader = event.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return;
  }
  
  try {
    event.context.user = await verifyToken(token);
  } catch (error) {
    logger.error('Token verification failed', { error: error instanceof Error ? error.message : String(error) });
  }
});

export default authMiddleware;

/**
 * 需要认证的中间件
 */
export const requireAuth = defineEventHandler(async (event) => {
  // 先运行基础认证中间件
  await authMiddleware(event);
  
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      message: '未登录或登录已过期'
    });
  }
});

/**
 * 需要特定角色的中间件
 */
export const requireRoles = (roles: string[]) => {
  return defineEventHandler(async (event) => {
    // 先运行认证中间件
    await requireAuth(event);
    
    if (!roles.includes(event.context.user!.role)) {
      throw createError({
        statusCode: 403,
        message: '没有权限执行此操作'
      });
    }
  });
};

/**
 * 超级管理员认证中间件
 */
export const requireAdmin = defineEventHandler(async (event) => {
  await requireRoles(['admin'])(event);
}); 