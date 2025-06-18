// 基础错误类
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 验证错误
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// 认证错误
export class AuthenticationError extends AppError {
  constructor(message: string = '未认证或认证已过期') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// 授权错误
export class AuthorizationError extends AppError {
  constructor(message: string = '没有操作权限') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// 资源不存在错误
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} 不存在`, 404, 'NOT_FOUND');
  }
}

// 冲突错误
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

// 错误处理中间件
export const errorHandler = (err: Error) => {
  if (err instanceof AppError) {
    return {
      error: {
        code: err.code,
        message: err.message
      },
      status: err.statusCode
    };
  }

  // 未知错误
  console.error('未捕获的错误:', err);
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    },
    status: 500
  };
}; 