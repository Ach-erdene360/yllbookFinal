
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Бизнесийн байгууллагууд' } }),
    prisma.category.create({ data: { name: 'Төрийн байгууллагууд' } }),
    prisma.category.create({ data: { name: 'ТББ' } }),
    prisma.category.create({ data: { name: 'Элчин сайд, консулын газрууд' } }),
    prisma.category.create({ data: { name: 'Аймаг, сумдын байгууллагууд' } }),
  ])

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