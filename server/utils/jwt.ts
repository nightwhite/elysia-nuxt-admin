import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";
import { AppError } from "./errors";
import type { AuthUser } from "../middleware/auth";

// 密钥（在生产环境中应该从环境变量获取）
const SECRET = new TextEncoder().encode(config.JWT_SECRET);

// 令牌过期时间
const TOKEN_EXPIRE = config.JWT_EXPIRE;

/**
 * 生成JWT令牌
 */
export async function generateToken(user: AuthUser): Promise<string> {
  try {
    const token = await new SignJWT({ 
      id: user.id,
      username: user.username,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRE)
      .sign(SECRET);
    
    return token;
  } catch (error) {
    throw new AppError('生成令牌失败', 500);
  }
}

/**
 * 验证JWT令牌
 */
export async function verifyToken(token: string): Promise<AuthUser> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    
    return {
      id: payload.id as number,
      username: payload.username as string,
      role: payload.role as string
    };
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      throw new AppError('令牌已过期', 401);
    }
    throw new AppError('无效的令牌', 401);
  }
}

/**
 * 刷新JWT令牌
 * 注意：这个实现允许使用过期的令牌进行刷新
 * 在生产环境中，你可能需要添加额外的安全措施，比如：
 * 1. 限制令牌的最大过期时间
 * 2. 维护一个刷新令牌黑名单
 * 3. 使用单独的刷新令牌
 */
export async function refreshToken(oldToken: string): Promise<string> {
  try {
    // 验证旧令牌（即使过期）
    const { payload } = await jwtVerify(oldToken, SECRET, {
      maxTokenAge: '7d' // 设置最大令牌年龄，超过此时间的令牌将无法刷新
    });
    
    // 生成新令牌
    const newToken = await new SignJWT({
      id: payload.id,
      username: payload.username,
      role: payload.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRE)
      .sign(SECRET);
    
    return newToken;
  } catch (error) {
    throw new AppError('刷新令牌失败', 401);
  }
} 