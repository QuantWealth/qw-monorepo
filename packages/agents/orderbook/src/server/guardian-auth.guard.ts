import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GuardianAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;
    
    // Load keys.json in real-time
    let keys: { guardian: string[] };
    try {
      const keysPath = path.resolve(__dirname, 'keys.json');
      const keysData = fs.readFileSync(keysPath, 'utf-8');
      keys = JSON.parse(keysData);
    } catch (error) {
      // If keys.json is missing or there's an error reading it, assume no valid keys
      throw new UnauthorizedException('Invalid API key');
    }

    // Check if the provided API key is in the guardian keys list
    if (keys.guardian.includes(apiKey)) {
      return true;
    } else {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
