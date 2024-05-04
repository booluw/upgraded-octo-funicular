export interface User {
  id: string
  role: 'ADMIN' | 'USER'
  username: string
  email: string
  firstName: string,
  lastName: string
  createdAt?: string
}