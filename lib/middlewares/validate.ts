import { NextResponse } from 'next/server';
import { AnySchema } from 'yup';

/**
 * 요청 바디를 Yup 스키마로 검증합니다.
 */
export function validateBody(schema: AnySchema) {
  return async (req: Request) => {
    try {
      const body = await req.json();
      await schema.validate(body);
      return NextResponse.next();
    } catch (err: any) {
      return NextResponse.json({ error: err.errors || err.message }, { status: 400 });
    }
  };
}
