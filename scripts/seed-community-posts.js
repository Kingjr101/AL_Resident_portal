/**
 * Community Board seed script
 *
 * Run with:
 *   node scripts/seed-community-posts.js
 *
 * This script only resets the communityPosts collection.
 * It does not modify residents, connections, messages, reports,
 * viewing feedback, events, or authentication data.
 */

const fs = require('fs')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env')

  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing environment file: ${envPath}`)
  }

  const text = fs.readFileSync(envPath, 'utf8')

  for (const line of text.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)

    if (match) {
      process.env[match[1]] = match[2]
    }
  }
}

loadEnv()

const daysAgo = (days) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000)

const daysFromNow = (days) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000)

async function main() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI
  const databaseName = process.env.DB_NAME

  if (!mongoUrl) {
    throw new Error('MONGO_URL or MONGODB_URI is not configured.')
  }

  if (!databaseName) {
    throw new Error('DB_NAME is not configured.')
  }

  const client = new MongoClient(mongoUrl)
  await client.connect()

  const db = client.db(databaseName)

  console.log(`Connected to ${databaseName}`)

  const properties = await db
    .collection('properties')
    .find({})
    .sort({ buildingName: 1 })
    .toArray()

  if (!properties.length) {
    throw new Error(
      'No properties found. Run node scripts/seed.js before seeding community posts.'
    )
  }

  const users = await db.collection('users').find({}).toArray()

  const residentsByProperty = new Map()
  const apmsByProperty = new Map()

  for (const user of users) {
    if (!user.propertyId) continue

    const propertyKey = user.propertyId.toString()

    if (user.role === 'RESIDENT') {
      if (!residentsByProperty.has(propertyKey)) {
        residentsByProperty.set(propertyKey, [])
      }

      residentsByProperty.get(propertyKey).push(user)
    }

    if (user.role === 'APM') {
      if (!apmsByProperty.has(propertyKey)) {
        apmsByProperty.set(propertyKey, [])
      }

      apmsByProperty.get(propertyKey).push(user)
    }
  }

  const communityPosts = []

  const addPost = ({
    property,
    author,
    title,
    description,
    category,
    createdDaysAgo,
    expiresInDays,
    isPinned = false,
    isStaffPost = false,
    status = 'ACTIVE',
  }) => {
    if (!property || !author) return

    communityPosts.push({
      _id: new ObjectId(),
      propertyId: property._id,
      authorId: author._id,
      title,
      description,
      category,
      status,
      isPinned,
      isStaffPost,
      isHidden: false,
      reportCount: 0,
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(createdDaysAgo),
      expiresAt: daysFromNow(expiresInDays),
      resolvedAt: status === 'RESOLVED' ? daysAgo(1) : null,
    })
  }

  for (const property of properties) {
    const propertyKey = property._id.toString()
    const residents = residentsByProperty.get(propertyKey) || []
    const apms = apmsByProperty.get(propertyKey) || []

    if (!residents.length) {
      console.warn(
        `Skipping ${property.buildingName}: no residents found for this property.`
      )
      continue
    }

    const staffAuthor = apms[0] || residents[0]

    addPost({
      property,
      author: staffAuthor,
      title: `${property.buildingName} community update`,
      description:
        'Catch up on upcoming events, shared-space reminders, and the latest community news. Check back each month for a fresh update.',
      category: 'NEWSLETTER',
      createdDaysAgo: 1,
      expiresInDays: 30,
      isPinned: true,
      isStaffPost: true,
    })

    addPost({
      property,
      author: residents[0],
      title: 'Looking for a dog sitter this Saturday',
      description:
        'I need someone to check in on my dog for a few hours Saturday afternoon. Happy to return the favour another weekend.',
      category: 'PET_HELP',
      createdDaysAgo: 0,
      expiresInDays: 7,
    })

    addPost({
      property,
      author: residents[1] || residents[0],
      title: 'Free moving boxes available',
      description:
        'I have several clean moving boxes in different sizes. Free to anyone in the building who can use them.',
      category: 'GIVEAWAY',
      createdDaysAgo: 2,
      expiresInDays: 10,
    })

    addPost({
      property,
      author: residents[2] || residents[0],
      title: 'Keys found near the elevator',
      description:
        'A small set of keys was found near the main-floor elevator. Please describe the keychain if the keys belong to you.',
      category: 'LOST_AND_FOUND',
      createdDaysAgo: 1,
      expiresInDays: 14,
    })

    addPost({
      property,
      author: residents[3] || residents[0],
      title: 'Board game evening this Friday',
      description:
        'A few neighbours are meeting in the lounge Friday evening. New players and beginners are welcome.',
      category: 'EVENT',
      createdDaysAgo: 3,
      expiresInDays: 6,
    })

    addPost({
      property,
      author: residents[4] || residents[0],
      title: 'Could someone water my plants?',
      description:
        'I will be away for a few days and could use help watering two small balcony plants. I can return the favour anytime.',
      category: 'HELP_WANTED',
      createdDaysAgo: 2,
      expiresInDays: 8,
    })

    addPost({
      property,
      author: staffAuthor,
      title: 'Reminder about shared community spaces',
      description:
        'Please remember to leave shared spaces tidy after use and take personal items with you when leaving.',
      category: 'ANNOUNCEMENT',
      createdDaysAgo: 4,
      expiresInDays: 21,
      isStaffPost: true,
    })
  }

  await db.collection('communityPosts').deleteMany({})

  if (communityPosts.length) {
    await db.collection('communityPosts').insertMany(communityPosts)
  }

  await db.collection('communityPosts').createIndex({
    propertyId: 1,
    status: 1,
    isHidden: 1,
    isPinned: -1,
    createdAt: -1,
  })

  await db.collection('communityPosts').createIndex({
    authorId: 1,
    createdAt: -1,
  })

  await db.collection('communityPosts').createIndex({
    expiresAt: 1,
  })

  console.log(
    `Seeded ${communityPosts.length} community board posts across ${properties.length} properties.`
  )

  await client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})