export interface User {
  id: string
  role: 'ADMIN' | 'USER'
  email: string
  firstName: string,
  lastName: string
  createdAt?: string
}