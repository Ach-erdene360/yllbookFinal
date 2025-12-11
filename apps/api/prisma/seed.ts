
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yellowbooks.mn' },
    update: {},
    create: {
      email: 'admin@yellowbooks.mn',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Upsert categories to avoid duplicate errors
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Бизнесийн байгууллагууд' },
      update: {},
      create: { name: 'Бизнесийн байгууллагууд' },
    }),
    prisma.category.upsert({
      where: { name: 'Төрийн байгууллагууд' },
      update: {},
      create: { name: 'Төрийн байгууллагууд' },
    }),
    prisma.category.upsert({
      where: { name: 'ТББ' },
      update: {},
      create: { name: 'ТББ' },
    }),
    prisma.category.upsert({
      where: { name: 'Элчин сайд, консулын газрууд' },
      update: {},
      create: { name: 'Элчин сайд, консулын газрууд' },
    }),
    prisma.category.upsert({
      where: { name: 'Аймаг, сумдын байгууллагууд' },
      update: {},
      create: { name: 'Аймаг, сумдын байгууллагууд' },
    }),
  ])

  console.log('✅ Categories ready')

  // Check if businesses already exist before creating
  const existingBusinesses = await prisma.business.count()
  
  if (existingBusinesses > 0) {
    console.log('✅ Businesses already seeded, skipping...')
    return
  }

  await prisma.business.createMany({
    data: [
      {
        name: 'Хувь хүний орлогын татварын ерөнхий газар',
        phone: '70123456',
        email: 'info@tax.mn',
        address: 'Улаанбаатар хот, Сүхбаатар дүүрэг',
        type: 'GOVERNMENT',
        categoryId: categories[1].id,
        links: { 
          youtube: "https://www.youtube.com/",
          website: "https://tov.gov.mn" 
        },
        image: "https://bbqboy.net/wp-content/uploads/2021/01/Embassy-vs-consulate.jpg",
        password: "qwerty"
      },
      {
        name: 'Хаан Банк',
        phone: '18001818',
        email: 'info@khanbank.com',
        address: 'Улаанбаатар хот, Сүхбаатар дүүрэг',
        website: 'https://www.khanbank.com',
        type: 'BUSINESS',
        categoryId: categories[0].id,
        links: { 
          youtube: "https://www.youtube.com/",
          website: "https://tov.gov.mn" 
        },
        image: "https://bbqboy.net/wp-content/uploads/2021/01/Embassy-vs-consulate.jpg",
        password: "qwerty"
      },
      {
        name: 'Монголын Улаан Загалмай Нийгэмлэг',
        phone: '70112233',
        email: 'info@redcross.mn',
        address: 'Улаанбаатар хот, Баянгол дүүрэг',
        type: 'NGO',
        categoryId: categories[2].id,
        links: { 
          youtube: "https://www.youtube.com/",
          website: "https://tov.gov.mn" 
        },
        image: "https://bbqboy.net/wp-content/uploads/2021/01/Embassy-vs-consulate.jpg",
        password: "qwerty"
      },
      {
        name: 'Америкийн Нэгдсэн Улсын Элчин сайдын яам',
        phone: '70071234',
        email: 'ulaanbaatar@state.gov',
        address: 'Улаанбаатар хот, Энхтайвны өргөн чөлөө',
        type: 'EMBASSY',
        categoryId: categories[3].id,
        links: { 
          youtube: "https://www.youtube.com/",
          website: "https://tov.gov.mn" 
        },
        image: "https://bbqboy.net/wp-content/uploads/2021/01/Embassy-vs-consulate.jpg",
        password: "qwerty"
      },
      {
        name: 'Төв аймгийн Засаг даргын тамгын газар',
        phone: '70223344',
        email: 'info@tov.gov.mn',
        address: 'Төв аймаг, Зуунмод хот',
        type: 'PROVINCE',
        categoryId: categories[4].id,
        links: { 
          youtube: "https://www.youtube.com/",
          website: "https://tov.gov.mn" 
        },
        image: "https://bbqboy.net/wp-content/uploads/2021/01/Embassy-vs-consulate.jpg",
        password: "qwerty"
      }
    ]
  })
}

main()
  .catch((e) => {
    console.error('Seed алдаа:', e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })