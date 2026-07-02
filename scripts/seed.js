/**
 * Resident Hub — seed script
 * Run with:  node scripts/seed.js
 * Loads MONGO_URL + DB_NAME from /app/.env
 */
const fs = require('fs')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')

// ---- load .env manually ----
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env')
  const txt = fs.readFileSync(envPath, 'utf8')
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) process.env[m[1]] = m[2]
  }
}
loadEnv()

const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000)
const dateOf = (s) => new Date(s + 'T12:00:00Z')
const pair = (a, b) => {
  const [x, y] = a.toString() < b.toString() ? [a, b] : [b, a]
  return { userAId: x, userBId: y }
}

async function main() {
  const client = new MongoClient(process.env.MONGO_URL)
  await client.connect()
  const db = client.db(process.env.DB_NAME)
  console.log('Connected to', process.env.DB_NAME)

  // ---- reset ----
  for (const c of ['properties', 'users', 'userProfiles', 'connections', 'messages', 'reports', 'eventIdeas']) {
    await db.collection(c).deleteMany({})
  }

  // ---- properties ----
  const props = [
    { _id: new ObjectId(), buildingName: 'Bow River Lofts', address: '210 8 Ave SW', city: 'Calgary', province: 'AB', unitCount: 88 },
    { _id: new ObjectId(), buildingName: 'Kensington Court', address: '1120 Kensington Rd NW', city: 'Calgary', province: 'AB', unitCount: 120 },
    { _id: new ObjectId(), buildingName: 'Whyte Ave Residences', address: '8215 104 St NW', city: 'Edmonton', province: 'AB', unitCount: 64 },
  ]
  await db.collection('properties').insertMany(props)
  const P = props.map(p => p._id)

  // ---- residents ----
  const R = [
    { p: 0, email: 'demo.resident@residenthub.ca', firstName: 'Emma', lastName: 'Tremblay', unit: '402', img: 5, open: true, moveIn: '2025-03-10', spot: 'The rooftop terrace', bio: "Recently moved to Calgary and loving it! Always up for a morning hike or a good book over coffee.", hobbies: ['hiking', 'coffee', 'yoga', 'book club'], interests: ['outdoors', 'wellness', 'community events'] },
    { p: 0, email: 'liam.gagnon@example.ca', firstName: 'Liam', lastName: 'Gagnon', unit: '210', img: 12, open: true, moveIn: '2025-01-15', spot: 'Games lounge', bio: 'Board game hoarder and weekend chef. Host a monthly game night — newcomers welcome.', hobbies: ['board games', 'gaming', 'cooking'], interests: ['technology', 'foodie', 'community events'] },
    { p: 0, email: 'olivia.roy@example.ca', firstName: 'Olivia', lastName: 'Roy', unit: '511', img: 9, open: true, moveIn: '2024-11-02', spot: 'Dog run out back', bio: 'Dog mom to a golden retriever named Biscuit. Runner, coffee enthusiast.', hobbies: ['dogs', 'running', 'coffee'], interests: ['pets', 'fitness', 'outdoors'] },
    { p: 0, email: 'noah.bouchard@example.ca', firstName: 'Noah', lastName: 'Bouchard', unit: '118', img: 15, open: true, moveIn: '2025-04-20', spot: 'Bike storage & courtyard', bio: 'Cyclist and live-music fan. Cooking my way through a new cuisine each month.', hobbies: ['cycling', 'live music', 'cooking'], interests: ['local music scene', 'foodie', 'fitness'] },
    { p: 0, email: 'ava.cote@example.ca', firstName: 'Ava', lastName: 'Cote', unit: '623', img: 16, open: true, moveIn: '2024-09-12', spot: 'Community garden', bio: 'Tending the community garden plot. Yoga in the mornings, crafts at night.', hobbies: ['gardening', 'yoga', 'book club'], interests: ['sustainability', 'wellness', 'arts & crafts'] },
    { p: 0, email: 'sophia.lavoie@example.ca', firstName: 'Sophia', lastName: 'Lavoie', unit: '305', img: 20, open: true, moveIn: '2025-02-27', spot: 'Café corner in the lobby', bio: 'Trail lover and travel planner. Ask me about the best local espresso.', hobbies: ['hiking', 'cycling', 'coffee'], interests: ['outdoors', 'travel', 'community events'] },
    { p: 0, email: 'william.morin@example.ca', firstName: 'William', lastName: 'Morin', unit: '707', img: 33, open: true, moveIn: '2025-05-05', spot: 'Games lounge', bio: 'New to the building! Gamer and vinyl collector looking to meet neighbours.', hobbies: ['gaming', 'board games', 'live music'], interests: ['technology', 'local music scene'] },
    { p: 0, email: 'charlotte.bergeron@example.ca', firstName: 'Charlotte', lastName: 'Bergeron', unit: '214', img: 44, open: false, moveIn: '2024-12-01', spot: 'Community kitchen', bio: 'Keeping to myself for now, but I love to cook and garden.', hobbies: ['cooking', 'gardening', 'dogs'], interests: ['foodie', 'pets', 'volunteering'] },
    // p2 Kensington Court
    { p: 1, email: 'jack.pelletier@example.ca', firstName: 'Jack', lastName: 'Pelletier', unit: '802', img: 51, open: true, moveIn: '2025-03-01', spot: 'Fitness room', bio: 'Marathon training in progress. Coffee runs after long runs.', hobbies: ['running', 'cycling', 'coffee'], interests: ['fitness', 'outdoors'] },
    { p: 1, email: 'mia.girard@example.ca', firstName: 'Mia', lastName: 'Girard', unit: '410', img: 25, open: true, moveIn: '2025-01-20', spot: 'Reading nook', bio: 'Yoga instructor and cookbook collector. Starting a building book club!', hobbies: ['yoga', 'cooking', 'book club'], interests: ['wellness', 'foodie'] },
    { p: 1, email: 'lucas.fortin@example.ca', firstName: 'Lucas', lastName: 'Fortin', unit: '615', img: 53, open: true, moveIn: '2024-10-14', spot: 'Games lounge', bio: 'Software dev by day, board-gamer by night.', hobbies: ['gaming', 'board games'], interests: ['technology', 'community events'] },
    { p: 1, email: 'amelia.ouellet@example.ca', firstName: 'Amelia', lastName: 'Ouellet', unit: '309', img: 29, open: true, moveIn: '2025-04-02', spot: 'Courtyard', bio: 'Dog walker, weekend hiker, and plant parent.', hobbies: ['dogs', 'hiking', 'gardening'], interests: ['pets', 'outdoors', 'sustainability'] },
    { p: 1, email: 'benjamin.caron@example.ca', firstName: 'Benjamin', lastName: 'Caron', unit: '118', img: 60, open: true, moveIn: '2025-02-10', spot: 'Lobby lounge', bio: 'Guitarist looking for a jam buddy. Also a decent cook.', hobbies: ['live music', 'coffee', 'cooking'], interests: ['local music scene', 'foodie'] },
    { p: 1, email: 'harper.belanger@example.ca', firstName: 'Harper', lastName: 'Belanger', unit: '720', img: 32, open: true, moveIn: '2024-11-25', spot: 'Fitness room', bio: 'Early-morning runner and yoga fan.', hobbies: ['running', 'yoga'], interests: ['fitness', 'wellness'] },
    // p3 Whyte Ave
    { p: 2, email: 'ethan.cloutier@example.ca', firstName: 'Ethan', lastName: 'Cloutier', unit: '205', img: 61, open: true, moveIn: '2025-03-18', spot: 'Bike storage', bio: 'Bike commuter and board-game host on Whyte Ave.', hobbies: ['cycling', 'board games', 'coffee'], interests: ['technology', 'community events'] },
    { p: 2, email: 'isla.nadeau@example.ca', firstName: 'Isla', lastName: 'Nadeau', unit: '112', img: 41, open: true, moveIn: '2024-12-20', spot: 'Community garden', bio: 'Gardener, baker, and crafter. Always sharing extra sourdough.', hobbies: ['gardening', 'cooking', 'book club'], interests: ['sustainability', 'foodie', 'arts & crafts'] },
    { p: 2, email: 'mason.levesque@example.ca', firstName: 'Mason', lastName: 'Levesque', unit: '408', img: 68, open: true, moveIn: '2025-01-08', spot: 'Rooftop deck', bio: 'Runner and gig-goer. Whyte Ave has the best live music.', hobbies: ['gaming', 'live music', 'running'], interests: ['local music scene', 'fitness'] },
    { p: 2, email: 'aria.poirier@example.ca', firstName: 'Aria', lastName: 'Poirier', unit: '301', img: 47, open: true, moveIn: '2025-04-28', spot: 'Dog run', bio: 'Hiker with a rescue pup. Morning yoga on the rooftop.', hobbies: ['hiking', 'dogs', 'yoga'], interests: ['outdoors', 'pets', 'wellness'] },
  ]

  const users = []
  const profiles = []
  const rid = []
  for (const r of R) {
    const _id = new ObjectId()
    rid.push(_id)
    users.push({
      _id, propertyId: P[r.p], email: r.email, passwordHash: 'demo',
      firstName: r.firstName, lastName: r.lastName, unitNumber: r.unit,
      isOpenToMeeting: r.open, role: 'RESIDENT', createdAt: dateOf(r.moveIn),
    })
    profiles.push({
      _id: new ObjectId(), userId: _id, bio: r.bio, hobbies: r.hobbies, interests: r.interests,
      photoUrl: `https://i.pravatar.cc/400?img=${r.img}`, moveInDate: dateOf(r.moveIn), favoriteSpotInBuilding: r.spot,
    })
  }

  // ---- staff ----
  const S = [
    { p: 0, email: 'demo.staff@residenthub.ca', firstName: 'Sarah', lastName: 'Mitchell', img: 48 },
    { p: 1, email: 'david.chen@residenthub.ca', firstName: 'David', lastName: 'Chen', img: 59 },
    { p: 2, email: 'rachel.nguyen@residenthub.ca', firstName: 'Rachel', lastName: 'Nguyen', img: 45 },
  ]
  const sid = []
  for (const s of S) {
    const _id = new ObjectId()
    sid.push(_id)
    users.push({
      _id, propertyId: P[s.p], email: s.email, passwordHash: 'demo',
      firstName: s.firstName, lastName: s.lastName, unitNumber: 'Staff',
      isOpenToMeeting: false, role: 'STAFF', createdAt: daysAgo(200),
    })
    profiles.push({
      _id: new ObjectId(), userId: _id, bio: 'Community manager', hobbies: [], interests: [],
      photoUrl: `https://i.pravatar.cc/400?img=${s.img}`, moveInDate: daysAgo(200), favoriteSpotInBuilding: 'Front office',
    })
  }

  await db.collection('users').insertMany(users)
  await db.collection('userProfiles').insertMany(profiles)

  // ---- connections ----
  // index refs are 0-based into rid[]
  const accepted = [
    [0, 1], [0, 2], [0, 5], [1, 6], [2, 3], [4, 5], // p1
    [8, 9],                                         // p2 (Jack-Mia)
    [14, 15],                                        // p3 (Ethan-Isla)
  ]
  const pending = [
    // requester -> target (incoming to Emma index 0)
    [3, 0], [6, 0], [4, 0],  // Noah->Emma, William->Emma, Ava->Emma
    [10, 11],                // p2 Lucas->Amelia
    [12, 13],                // p2 Benjamin->Harper
    [16, 17],                // p3 Mason->Aria
  ]

  const connDocs = []
  const connByKey = {}
  for (const [a, b] of accepted) {
    const { userAId, userBId } = pair(rid[a], rid[b])
    const _id = new ObjectId()
    connByKey[`${a}-${b}`] = _id
    connDocs.push({ _id, userAId, userBId, requesterId: rid[a], status: 'ACCEPTED', createdAt: daysAgo(20 + a) })
  }
  for (const [a, b] of pending) {
    const { userAId, userBId } = pair(rid[a], rid[b])
    connDocs.push({ _id: new ObjectId(), userAId, userBId, requesterId: rid[a], status: 'PENDING', createdAt: daysAgo(2 + (a % 4)) })
  }
  await db.collection('connections').insertMany(connDocs)

  // ---- messages (4 conversations, ~30 msgs) ----
  const convos = [
    { key: '0-1', a: 0, b: 1 }, // Emma & Liam
    { key: '0-2', a: 0, b: 2 }, // Emma & Olivia
    { key: '0-5', a: 0, b: 5 }, // Emma & Sophia
    { key: '1-6', a: 1, b: 6 }, // Liam & William
  ]
  const scripts = [
    ['Hey Liam! Saw you host game nights — mind if I join the next one?', 'Absolutely, the more the merrier! Fridays at 7 in the lounge.', 'Perfect, I make a mean guacamole 🥑', 'Now you HAVE to come.', 'Haha deal. See you Friday!', 'Bringing Catan and Codenames.', 'Love both. Can invite a couple others?', 'Please do!'],
    ['Olivia! Is that Biscuit in the elevator? So cute!', 'That\'s him! He\'s a menace but we love him.', 'I run mornings too — want a running buddy?', 'Yes! 6:30am by the river?', 'You\'re on. Coffee after?', 'Non-negotiable ☕', 'See you tomorrow!'],
    ['Sophia, you mentioned a great espresso spot?', 'Monogram on 8th — best flat white in the city.', 'Adding to my list. Up for a weekend hike sometime?', 'Always! Grotto Canyon is gorgeous right now.', 'Let\'s plan for Saturday.', 'Done. I\'ll bring trail snacks.'],
    ['Welcome to the building William!', 'Thanks Liam! Still unpacking boxes.', 'Vinyl collector eh? We should compare records.', 'For sure — I\'ve got a stack of jazz.', 'Come by game night too.', 'you keep messaging me about this, kind of a lot', 'Oh, sorry — didn\'t mean to overdo it.'],
  ]
  const msgDocs = []
  const convoFirstWilliamMsgId = { _id: null }
  convos.forEach((c, ci) => {
    const connId = connByKey[c.key]
    const senders = [rid[c.a], rid[c.b]]
    scripts[ci].forEach((content, mi) => {
      const _id = new ObjectId()
      const senderId = senders[mi % 2]
      // capture a William message (index 6 is the "kind of a lot" line) for report attachment
      if (c.key === '1-6' && mi === 5) convoFirstWilliamMsgId._id = _id
      msgDocs.push({
        _id, connectionId: connId, senderId, content,
        timestamp: new Date(Date.now() - (scripts[ci].length - mi) * 3 * 60 * 60 * 1000 - ci * 24 * 60 * 60 * 1000),
        isRead: mi < scripts[ci].length - 1,
      })
    })
  })
  await db.collection('messages').insertMany(msgDocs)

  // ---- reports (2 open + 1 resolved), all in property 1 (demo staff) ----
  const reports = [
    {
      _id: new ObjectId(), reporterId: rid[0], reportedUserId: rid[6], connectionId: null, messageId: null,
      reason: 'INAPPROPRIATE', details: 'Received an unsolicited connection request with an off-putting note.',
      status: 'OPEN', createdAt: daysAgo(1), resolvedAt: null, resolvedByStaffId: null,
    },
    {
      _id: new ObjectId(), reporterId: rid[1], reportedUserId: rid[6], connectionId: connByKey['1-6'], messageId: convoFirstWilliamMsgId._id,
      reason: 'HARASSMENT', details: 'Repeated messages after I asked to slow down. Flagging the conversation.',
      status: 'OPEN', createdAt: daysAgo(2), resolvedAt: null, resolvedByStaffId: null,
    },
    {
      _id: new ObjectId(), reporterId: rid[2], reportedUserId: rid[1], connectionId: null, messageId: null,
      reason: 'SPAM', details: 'Kept promoting a side business in chat.', staffNotes: 'Spoke with resident; was a one-off. Resident apologized.',
      status: 'RESOLVED', createdAt: daysAgo(9), resolvedAt: daysAgo(7), resolvedByStaffId: sid[0],
    },
  ]
  await db.collection('reports').insertMany(reports)

  // ---- event ideas ----
  const events = [
    { _id: new ObjectId(), propertyId: P[0], title: 'Rooftop Coffee & Connect', description: 'Casual morning meetup on the rooftop terrace — coffee and pastries on us. Great for new neighbours.', suggestedFromInterestTag: 'coffee', createdByStaffId: sid[0], scheduledFor: daysAgo(-6), createdAt: daysAgo(5) },
    { _id: new ObjectId(), propertyId: P[0], title: 'Community Garden Kickoff', description: 'Claim a plot, meet fellow green thumbs, and plan the summer harvest together.', suggestedFromInterestTag: 'sustainability', createdByStaffId: sid[0], scheduledFor: daysAgo(-12), createdAt: daysAgo(4) },
    { _id: new ObjectId(), propertyId: P[2], title: 'Whyte Ave Live Music Night', description: 'An evening of local acoustic acts in the lounge. Bring an instrument if you play!', suggestedFromInterestTag: 'local music scene', createdByStaffId: sid[2], scheduledFor: daysAgo(-9), createdAt: daysAgo(3) },
  ]
  await db.collection('eventIdeas').insertMany(events)

  // ---- indexes ----
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('users').createIndex({ propertyId: 1, role: 1 })
  await db.collection('users').createIndex({ propertyId: 1, isOpenToMeeting: 1 })
  await db.collection('userProfiles').createIndex({ userId: 1 }, { unique: true })
  await db.collection('userProfiles').createIndex({ hobbies: 1 })
  await db.collection('userProfiles').createIndex({ interests: 1 })
  await db.collection('connections').createIndex({ userAId: 1, userBId: 1 }, { unique: true })
  await db.collection('messages').createIndex({ connectionId: 1, timestamp: -1 })
  await db.collection('reports').createIndex({ status: 1, createdAt: -1 })

  console.log(`Seeded: ${props.length} properties, ${users.length} users (${R.length} residents + ${S.length} staff), ${connDocs.length} connections, ${msgDocs.length} messages, ${reports.length} reports, ${events.length} events.`)
  await client.close()
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
