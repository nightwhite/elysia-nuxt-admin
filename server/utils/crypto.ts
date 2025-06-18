/**
 * 密码加密和验证工具
 */

/**
 * 对密码进行哈希处理
 */
export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, {
    algorithm: "argon2id",  // 使用 argon2id 算法
    memoryCost: 65536,      // 内存使用量（KB）
    timeCost: 2,           // 迭代次数
  });
}

/**
 * 验证密码是否匹配
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return Bun.password.verify(password, hashedPassword);
}

/**
 * 验证密码强度
 * 要求：
 * 1. 最少8个字符
 * 2. 至少包含一个大写字母
 * 3. 至少包含一个小写字母
 * 4. 至少包含一个数字
 * 5. 至少包含一个特殊字符
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: '密码长度至少为8个字符' }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: '密码必须包含至少一个大写字母' }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: '密码必须包含至少一个小写字母' }
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: '密码必须包含至少一个数字' }
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: '密码必须包含至少一个特殊字符' }
  }

  return { isValid: true, message: '密码强度符合要求' }
} 