import { NextResponse } from 'next/server';

/**
 * API 핸들러를 래핑하여 예외를 처리합니다.
 */
export function withErrorHandler<T extends (req: any, context?: any) => Promise<any>>(handler: T) {
  return async (req: Parameters<T>[0], context: any) => {
    try {
      return await handler(req, context);
    } catch (err: any) {
      console.error('[Error]', err);
      return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
  };
}
