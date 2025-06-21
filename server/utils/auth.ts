import { Elysia } from "elysia"
import { verifyToken } from "./jwt"
import type { AuthUser } from "~/types/global"
import { logger } from "./logger"

// 身份验证检查函数
const checkAuth = async (headers: Record<string, string | undefined>): Promise<AuthUser> => {
  const authHeader = headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error("未登录或登录已过期");
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error("未登录或登录已过期");
  }
  
  try {
    return await verifyToken(token);
  } catch (error) {
    logger.error('Token verification failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw new Error("未登录或登录已过期");
  }
};

// 管理员权限检查函数
const checkAdmin = async (headers: Record<string, string | undefined>): Promise<AuthUser> => {
  const user = await checkAuth(headers);
  
  if (user.role !== 'admin') {
    throw new Error("没有权限执行此操作");
  }
  
  return user;
};

/**
 * 需要认证的中间件
 * 如果用户未登录，返回 401 错误
 */
export const requireAuth = new Elysia({ name: 'requireAuth' })
  .onBeforeHandle({ as: 'scoped' }, async ({ headers, set }) => {
    try {
      await checkAuth(headers);
    } catch (error) {
      set.status = 401;
      return { error: error instanceof Error ? error.message : String(error) };
    }
  });

/**
 * 需要管理员权限的中间件
 * 如果用户未登录或不是管理员，返回相应错误
 */
export const requireAdmin = new Elysia({ name: 'requireAdmin' })
  .onBeforeHandle({ as: 'scoped' }, async ({ headers, set }) => {
    try {
      await checkAdmin(headers);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("权限")) {
        set.status = 403;
      } else {
        set.status = 401;
      }
      return { error: message };
    }
  });

/**
 * 需要特定角色的中间件工厂函数
 * @param roles 允许的角色列表
 */
export const requireRole = (roles: string[]) => 
  new Elysia({ name: `requireRole-${roles.join('-')}` })
    .onBeforeHandle({ as: 'scoped' }, async ({ headers, set }) => {
      try {
        const user = await checkAuth(headers);
        if (!roles.includes(user.role)) {
          set.status = 403;
          return { error: "没有权限执行此操作" };
        }
      } catch (error) {
        set.status = 401;
        return { error: error instanceof Error ? error.message : String(error) };
      }
    });

/**
 * 用户只能访问自己数据的中间件
 * 用于需要检查用户ID的接口
 */
export const requireSelfOrAdmin = new Elysia({ name: 'requireSelfOrAdmin' })
  .onBeforeHandle({ as: 'scoped' }, async ({ headers, params, set }) => {
    try {
      const user = await checkAuth(headers);
      
      // 如果是管理员，允许访问
      if (user.role === 'admin') {
        return;
      }
      
      // 如果不是管理员，检查是否访问自己的数据
      const userId = params && 'id' in params ? parseInt(params.id as string) : null;
      if (userId && user.id !== userId) {
        set.status = 403;
        return { error: "没有权限访问" };
      }
    } catch (error) {
      set.status = 401;
      return { error: error instanceof Error ? error.message : String(error) };
    }
  });
