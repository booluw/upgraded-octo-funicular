export interface User {
  id: string
  role: 'ADMIN' | 'USER'
  username: string
  email: string
  firstName: string
  lastName: string
  location: string
  phone_number: string
  img: string
  createdAt?: string
}