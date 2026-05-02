import '../src/app/config'
import prisma from '../src/app/helpers/prisma'
import { HashPassword } from '../src/app/helpers/HashPassword'
import { Role } from '../src/generated/prisma/enums'

async function main() {
  const email = 'admin@example.com'
  const password = await HashPassword('Password123!')

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Demo Admin',
      email,
      password,
    },
  })

  let workspace = await prisma.workspace.findFirst({
    where: { name: 'Demo Workspace' },
  })

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Demo Workspace',
        description: 'Seeded workspace for local dev',
        accentColor: '#6366f1',
      },
    })
  }

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: { userId: user.id, workspaceId: workspace.id },
    },
    update: { role: Role.ADMIN },
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: Role.ADMIN,
    },
  })

  console.log('Seed done:', { user: user.email, workspace: workspace.name })
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    void prisma.$disconnect()
    process.exit(1)
  })
