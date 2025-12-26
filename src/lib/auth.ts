// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';

// export function getAuthUser() {
//   const token = cookies().get('auth')?.value;
//   if (!token) return null;

//   try {
//     return jwt.verify(token, process.env.JWT_SECRET!);
//   } catch {
//     return null;
//   }
// }
