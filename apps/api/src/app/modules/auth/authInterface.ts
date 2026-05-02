export type TLogin = {
  email: string
  password: string
}

export type TRegister = {
  name: string
  email: string
  password: string
  workspaceName?: string
  description?: string
}
