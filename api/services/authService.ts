import jwt from 'jsonwebtoken';
import userService from './userService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

class AuthService {
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  }

  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    try {
      // Get user with password hash
      const user = await userService.getUserByEmail(email);
      
      // Verify password
      const isValidPassword = await userService.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      // Return user data without password hash
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'player' | 'manager';
  }): Promise<AuthResponse> {
    try {
      // Create user
      const user = await userService.createUser(userData);

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = this.generateAccessToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      return {
        user,
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
      
      // Get current user data
      const user = await userService.getUserById(decoded.userId);
      
      // Generate new tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = this.generateAccessToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken(tokenPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      
      // Verify user still exists and is active
      await userService.getUserById(decoded.userId);
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Get user with password hash
      const user = await userService.getUserById(userId);
      const userWithPassword = await userService.getUserByEmail(user.email);
      
      // Verify current password
      const isValidPassword = await userService.verifyPassword(currentPassword, userWithPassword.passwordHash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password (this would need to be implemented in userService)
      // For now, we'll throw an error indicating this needs implementation
      throw new Error('Password change functionality needs to be implemented in userService');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password change failed');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Verify user exists
      await userService.getUserByEmail(email);
      
      // In a real implementation, you would:
      // 1. Generate a password reset token
      // 2. Store it in the database with expiration
      // 3. Send email with reset link
      
      // For now, we'll just log that a reset was requested
      console.log(`Password reset requested for email: ${email}`);
    } catch (error) {
      // Don't reveal if email exists or not for security
      console.log(`Password reset requested for email: ${email}`);
    }
  }

  async resetPassword(
    resetToken: string,
    newPassword: string
  ): Promise<void> {
    // This would need to be implemented with proper token validation
    // and password update functionality
    throw new Error('Password reset functionality needs to be implemented');
  }
}

export default new AuthService();