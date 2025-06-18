import { eventHandler, createError, getQuery, readBody, defineEventHandler } from 'h3';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validateUser,
  getFilteredUsers
} from "../services/userService";
import type {
  LoginParams,
  CreateUserParams,
  UpdateUserParams,
  UserFilterParams
} from "../services/userService";
import { logger } from "../utils/logger";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { generateToken, refreshToken } from "../utils/jwt";

// 定义路由处理器
const handlers = {
  /**
   * 获取所有用户
   */
  listUsers: defineEventHandler(async (event) => {
    await requireAdmin(event);
    return getAllUsers();
  }),

  /**
   * 筛选用户
   */
  filterUsers: defineEventHandler(async (event) => {
    await requireAdmin(event);
    const query = getQuery(event);
    
    const filters: UserFilterParams = {
      search: query.search as string,
      role: query.role as string
    };
    
    return getFilteredUsers(filters);
  }),

  /**
   * 根据ID获取用户
   */
  getUser: defineEventHandler(async (event) => {
    await requireAuth(event);
    const params = event.context.params || {};
    const id = parseInt(params.id as string);
    
    // 普通用户只能查看自己的信息
    if (event.context.user!.role !== 'admin' && event.context.user!.id !== id) {
      throw createError({
        statusCode: 403,
        message: '没有权限访问'
      });
    }
    
    const userInfo = getUserById(id);
    if (!userInfo) {
      throw createError({
        statusCode: 404,
        message: '用户不存在'
      });
    }
    return userInfo;
  }),

  /**
   * 创建用户
   */
  createNewUser: defineEventHandler(async (event) => {
    await requireAdmin(event);
    const body = await readBody(event);
    
    try {
      const id = await createUser(body);
      return { id, success: true };
    } catch (error: any) {
      throw createError({
        statusCode: 400,
        message: error.message
      });
    }
  }),

  /**
   * 更新用户
   */
  updateUserInfo: defineEventHandler(async (event) => {
    await requireAuth(event);
    const params = event.context.params || {};
    const id = parseInt(params.id as string);
    const body = await readBody(event);
    
    // 普通用户只能更新自己的信息，且不能更改角色
    if (event.context.user!.role !== 'admin') {
      if (event.context.user!.id !== id) {
        throw createError({
          statusCode: 403,
          message: '没有权限访问'
        });
      }
      if (body.role) {
        throw createError({
          statusCode: 403,
          message: '无权更改角色'
        });
      }
    }
    
    try {
      const success = await updateUser(id, body);
      if (!success) {
        throw createError({
          statusCode: 400,
          message: '更新失败'
        });
      }
      return { success: true };
    } catch (error: any) {
      throw createError({
        statusCode: 400,
        message: error.message
      });
    }
  }),

  /**
   * 删除用户
   */
  deleteUserById: defineEventHandler(async (event) => {
    await requireAdmin(event);
    const params = event.context.params || {};
    const id = parseInt(params.id as string);
    
    try {
      const success = deleteUser(id);
      return { success };
    } catch (error: any) {
      throw createError({
        statusCode: 400,
        message: error.message
      });
    }
  }),

  /**
   * 用户登录
   */
  login: defineEventHandler(async (event) => {
    const { username, password } = await readBody(event);
    
    // 尝试验证
    const user = await validateUser(username, password);
    logger.debug('用户验证结果', { success: !!user });
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户名或密码错误'
      });
    }
    
    // 生成JWT令牌
    const token = await generateToken(user);
    logger.debug('生成令牌成功');
    
    return {
      user,
      token
    };
  }),

  /**
   * 刷新令牌
   */
  refreshUserToken: defineEventHandler(async (event) => {
    const authHeader = event.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw createError({
        statusCode: 401,
        message: '未提供令牌'
      });
    }
    
    try {
      const newToken = await refreshToken(token);
      logger.debug('令牌刷新成功');
      return { token: newToken };
    } catch (error) {
      throw createError({
        statusCode: 401,
        message: '刷新令牌失败'
      });
    }
  })
};

// 导出路由配置
export default {
  routes: {
    '/list': {
      get: handlers.listUsers
    },
    '/filter': {
      get: handlers.filterUsers
    },
    '/:id': {
      get: handlers.getUser,
      put: handlers.updateUserInfo,
      delete: handlers.deleteUserById
    },
    '/': {
      post: handlers.createNewUser
    },
    '/login': {
      post: handlers.login
    },
    '/refresh-token': {
      post: handlers.refreshUserToken
    }
  }
}; 