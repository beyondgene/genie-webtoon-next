// lib/middlewares/validate.ts
import { NextResponse } from 'next/server';
import type { AnySchema } from 'yup';

/**
 * 요청 Body를 Yup 스키마로 검증합니다.
 * - 성공: null 반환 (계속 진행)
 * - 실패: NextResponse(JSON 오류, 400) 반환 (즉시 리턴)
 */
export function validateBody(schema: AnySchema) {
  return async (req: Request): Promise<NextResponse | null> => {
    try {
      const body = await req.json();
      await schema.validate(body);
      return null;
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.errors ?? err?.message ?? 'Invalid request body' },
        { status: 400 }
      );
    }
  };
}
