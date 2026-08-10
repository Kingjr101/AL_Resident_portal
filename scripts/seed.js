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
  for (const c of ['properties', 'users', 'userProfiles', 'connections', 'messages', 'reports', 'eventIdeas', 'viewingFeedback']) {
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

  // ---- residents (with personality-tailored chatScript) ----
  const R = [
    {
      p: 0, email: 'demo.resident@residenthub.ca', firstName: 'Emma', lastName: 'Tremblay', unit: '402', img: 5, open: true, moveIn: '2025-03-10', spot: 'The rooftop terrace',
      bio: "Recently moved to Calgary and loving it! Always up for a morning hike or a good book over coffee.",
      hobbies: ['hiking', 'coffee', 'yoga', 'book club'], interests: ['outdoors', 'wellness', 'community events'],
      chat: {
        greeting: "Hi there! 👋 Still can't believe how much I love it here already.",
        quickReplies: [
          { label: "Best trail you've found near the city?", response: "Nose Hill early morning — quiet, big skies, barely anyone around. Do you hike?" },
          { label: "You're a coffee person too?", response: "Obsessed. I do a slow pour-over every morning like it's a ritual ☕ Got a favourite spot?" },
          { label: "What's the book club reading?", response: "Just started 'Tomorrow, and Tomorrow, and Tomorrow' — so good. Always room for one more!" },
        ],
        closer: "We should do a morning hike then coffee sometime — my perfect Saturday 🥾☕",
      },
    },
    {
      p: 0, email: 'liam.gagnon@example.ca', firstName: 'Liam', lastName: 'Gagnon', unit: '210', img: 12, open: true, moveIn: '2025-01-15', spot: 'Games lounge',
      bio: 'Board game hoarder and weekend chef. Host a monthly game night — newcomers welcome.',
      hobbies: ['board games', 'gaming', 'cooking'], interests: ['technology', 'foodie', 'community events'],
      chat: {
        greeting: "Hey! 👋 Welcome — you into games at all?",
        quickReplies: [
          { label: "Tell me about this monthly game night.", response: "Last Friday of the month in the lounge — I've got a whole shelf, newcomers always welcome 🎲" },
          { label: "What are you cooking these days?", response: "Weekend project was ramen from scratch. Took 6 hours. Worth it. Barely." },
          { label: "Favourite board game right now?", response: "Wingspan for chill nights, Root when I want to lose friends 😅 You play?" },
        ],
        closer: "Seriously, come to game night — first snack's on me!",
      },
    },
    {
      p: 0, email: 'olivia.roy@example.ca', firstName: 'Olivia', lastName: 'Roy', unit: '511', img: 9, open: true, moveIn: '2024-11-02', spot: 'Dog run out back',
      bio: 'Dog mom to a golden retriever named Biscuit. Runner, coffee enthusiast.',
      hobbies: ['dogs', 'running', 'coffee'], interests: ['pets', 'fitness', 'outdoors'],
      chat: {
        greeting: "Hey neighbour! 👋 (Biscuit says hi too 🐕)",
        quickReplies: [
          { label: "Okay, tell me about Biscuit!", response: "Golden retriever, 3 years old, zero brain cells, all heart. He runs with me most mornings." },
          { label: "You run — any good routes?", response: "River pathway loop is my go-to. Easy 5k. Want a running buddy sometime?" },
          { label: "Coffee after runs, I hear?", response: "Always! Earned calories are the best calories ☕ There's a great spot two blocks over." },
        ],
        closer: "Let's grab a coffee — bring your dog if you've got one, Biscuit needs friends!",
      },
    },
    {
      p: 0, email: 'noah.bouchard@example.ca', firstName: 'Noah', lastName: 'Bouchard', unit: '118', img: 15, open: true, moveIn: '2025-04-20', spot: 'Bike storage & courtyard',
      bio: 'Cyclist and live-music fan. Cooking my way through a new cuisine each month.',
      hobbies: ['cycling', 'live music', 'cooking'], interests: ['local music scene', 'foodie', 'fitness'],
      chat: {
        greeting: "Hey neighbour 👋 What's good?",
        quickReplies: [
          { label: "Any good bike routes around here?", response: "The river pathway is unreal — I do it every Sunday morning. Wanna come next time?" },
          { label: "What cuisine are you tackling this month?", response: "Thai! Made pad see ew last night. Almost burned the wok but we got there 😅" },
          { label: "Any live shows coming up?", response: "Got tickets to a jazz thing at Ironwood next week — always room for one more." },
        ],
        closer: "Yo we should ride sometime. Slow pace, good coffee stop halfway ☕",
      },
    },
    {
      p: 0, email: 'ava.cote@example.ca', firstName: 'Ava', lastName: 'Cote', unit: '623', img: 16, open: true, moveIn: '2024-09-12', spot: 'Community garden',
      bio: 'Tending the community garden plot. Yoga in the mornings, crafts at night.',
      hobbies: ['gardening', 'yoga', 'book club'], interests: ['sustainability', 'wellness', 'arts & crafts'],
      chat: {
        greeting: "Hi! 👋 So nice to meet a neighbour.",
        quickReplies: [
          { label: "You garden — what's growing right now?", response: "Tomatoes, basil, and way too much zucchini. Come by the plot, I'll send you home with some 🌿" },
          { label: "Morning yoga sounds lovely — beginner friendly?", response: "Totally! I do a gentle flow on the terrace at 7. No experience needed, just comfy clothes." },
          { label: "What crafts are you into?", response: "Lately it's been hand-lettering and a bit of pottery. Messy but so calming." },
        ],
        closer: "If you ever want fresh veggies or a slow morning yoga, you know where to find me 🧘",
      },
    },
    {
      p: 0, email: 'sophia.lavoie@example.ca', firstName: 'Sophia', lastName: 'Lavoie', unit: '305', img: 20, open: true, moveIn: '2025-02-27', spot: 'Café corner in the lobby',
      bio: 'Trail lover and travel planner. Ask me about the best local espresso.',
      hobbies: ['hiking', 'cycling', 'coffee'], interests: ['outdoors', 'travel', 'community events'],
      chat: {
        greeting: "Hi! 👋 Welcome to the building — always excited to meet neighbours!",
        quickReplies: [
          { label: "Okay I have to ask — best local espresso?", response: "Rosso on 4th Street, no contest. Order the cortado. Thank me later ☕" },
          { label: "Any good hikes for a beginner?", response: "Grassi Lakes in Canmore — 2 hours out, super doable, gorgeous. I go monthly!" },
          { label: "You mentioned travel planning — any dream trips?", response: "Just booked Portugal for October 🇵🇹 Been prepping the itinerary for weeks." },
        ],
        closer: "If you're ever planning a trip, I'm basically a walking travel agent — hit me up!",
      },
    },
    {
      p: 0, email: 'william.morin@example.ca', firstName: 'William', lastName: 'Morin', unit: '707', img: 33, open: true, moveIn: '2025-05-05', spot: 'Games lounge',
      bio: 'New to the building! Gamer and vinyl collector looking to meet neighbours.',
      hobbies: ['gaming', 'board games', 'live music'], interests: ['technology', 'local music scene'],
      chat: {
        greeting: "Hey! 👋 Just moved in — still figuring out where the good coffee is around here.",
        quickReplies: [
          { label: "What are you playing lately?", response: "Deep in Baldur's Gate 3 — send help. What about you, any recommendations?" },
          { label: "Vinyl collector eh? What's your latest pickup?", response: "Just grabbed a used copy of Kendrick's GNX — sounds unreal on vinyl." },
          { label: "Down for a board game night sometime?", response: "100%. I'll bring Catan if you bring snacks 🎲" },
        ],
        closer: "For real though — hit me up whenever. Always down to meet neighbours!",
      },
    },
    {
      p: 0, email: 'charlotte.bergeron@example.ca', firstName: 'Charlotte', lastName: 'Bergeron', unit: '214', img: 44, open: false, moveIn: '2024-12-01', spot: 'Community kitchen',
      bio: 'Keeping to myself for now, but I love to cook and garden.',
      hobbies: ['cooking', 'gardening', 'dogs'], interests: ['foodie', 'pets', 'volunteering'],
      chat: {
        greeting: "Oh, hi! 👋 I'm a bit of a homebody, but it's nice to say hello.",
        quickReplies: [
          { label: "What do you like to cook?", response: "Lots of slow, cozy stuff — stews, fresh bread. Baking's my therapy honestly." },
          { label: "You garden too?", response: "A little! Herbs on my balcony mostly. Rosemary's thriving, basil's dramatic." },
          { label: "I heard you volunteer — where?", response: "At the pet rescue on weekends. Warning: I will show you 400 dog photos 🐾" },
        ],
        closer: "I'm quieter than most, but always happy to trade recipes or dog pics!",
      },
    },
    {
      p: 1, email: 'jack.pelletier@example.ca', firstName: 'Jack', lastName: 'Pelletier', unit: '802', img: 51, open: true, moveIn: '2025-03-01', spot: 'Fitness room',
      bio: 'Marathon training in progress. Coffee runs after long runs.',
      hobbies: ['running', 'cycling', 'coffee'], interests: ['fitness', 'outdoors'],
      chat: {
        greeting: "Hey! 👋 Good to meet you.",
        quickReplies: [
          { label: "Marathon training — which one?", response: "Calgary Marathon in the spring. Currently at the 'why did I sign up' stage 😅" },
          { label: "Run or ride — which do you prefer?", response: "Run for the head space, ride for the distance. Both end at a coffee shop though." },
          { label: "Best post-workout coffee spot?", response: "There's a little roaster by the LRT — flat white after a long run hits different ☕" },
        ],
        closer: "If you're ever up for an easy jog, I promise to keep the pace chatty!",
      },
    },
    {
      p: 1, email: 'mia.girard@example.ca', firstName: 'Mia', lastName: 'Girard', unit: '410', img: 25, open: true, moveIn: '2025-01-20', spot: 'Reading nook',
      bio: 'Yoga instructor and cookbook collector. Starting a building book club!',
      hobbies: ['yoga', 'cooking', 'book club'], interests: ['wellness', 'foodie'],
      chat: {
        greeting: "Hi! 👋 So lovely to meet a neighbour.",
        quickReplies: [
          { label: "You teach yoga — any classes here?", response: "Thinking of starting a Sunday session in the lounge! Would you come? All levels welcome 🧘‍♀️" },
          { label: "Cookbook collector — favourite right now?", response: "Ottolenghi's 'Simple' — my kitchen smells amazing and looks like a crime scene." },
          { label: "Tell me about the book club!", response: "Just getting it going — first pick's a cozy mystery. We meet with wine and snacks 🍷" },
        ],
        closer: "Come for yoga, stay for the book club snacks — I'd love to have you!",
      },
    },
    {
      p: 1, email: 'lucas.fortin@example.ca', firstName: 'Lucas', lastName: 'Fortin', unit: '615', img: 53, open: true, moveIn: '2024-10-14', spot: 'Games lounge',
      bio: 'Software dev by day, board-gamer by night.',
      hobbies: ['gaming', 'board games'], interests: ['technology', 'community events'],
      chat: {
        greeting: "Hey 👋 Nice to meet you!",
        quickReplies: [
          { label: "Dev by day — what do you build?", response: "Mostly web apps. By night I rage at ranked though, much healthier hobby 😂" },
          { label: "What are you gaming lately?", response: "Helldivers 2 with the squad. Democracy doesn't spread itself. You play?" },
          { label: "Board games too?", response: "Big time. Terraforming Mars is my current obsession. Fair warning: I take turns seriously." },
        ],
        closer: "We should get a games group going in the building — you in?",
      },
    },
    {
      p: 1, email: 'amelia.ouellet@example.ca', firstName: 'Amelia', lastName: 'Ouellet', unit: '309', img: 29, open: true, moveIn: '2025-04-02', spot: 'Courtyard',
      bio: 'Dog walker, weekend hiker, and plant parent.',
      hobbies: ['dogs', 'hiking', 'gardening'], interests: ['pets', 'outdoors', 'sustainability'],
      chat: {
        greeting: "Hi neighbour! 👋",
        quickReplies: [
          { label: "You've got a dog?", response: "A scruffy little rescue named Moose. Big name, tiny dog. He's the boss 🐶" },
          { label: "Weekend hikes — where do you go?", response: "Anything in Kananaskis. Moose has summited more peaks than me at this point." },
          { label: "Plant parent — how many is too many?", response: "I have 23 and my answer is 'never enough' 🌱 Ask me for cuttings anytime!" },
        ],
        closer: "If you like dogs, dirt, or trails, we're going to get along great 🐾",
      },
    },
    {
      p: 1, email: 'benjamin.caron@example.ca', firstName: 'Benjamin', lastName: 'Caron', unit: '118', img: 60, open: true, moveIn: '2025-02-10', spot: 'Lobby lounge',
      bio: 'Guitarist looking for a jam buddy. Also a decent cook.',
      hobbies: ['live music', 'coffee', 'cooking'], interests: ['local music scene', 'foodie'],
      chat: {
        greeting: "Hey! 👋 What's good, neighbour?",
        quickReplies: [
          { label: "You play — what instrument?", response: "Guitar mostly, a bit of piano. Been dying to find a jam buddy in the building 🎸" },
          { label: "Catch any good shows lately?", response: "Saw a folk trio at a tiny bar last week — goosebumps. I keep a gig list if you want in." },
          { label: "What's your kitchen specialty?", response: "A mean weekend brunch. Come hungry, leave in a food coma. That's the promise." },
        ],
        closer: "If you play anything at all, let's jam — even a tambourine counts!",
      },
    },
    {
      p: 1, email: 'harper.belanger@example.ca', firstName: 'Harper', lastName: 'Belanger', unit: '720', img: 32, open: true, moveIn: '2024-11-25', spot: 'Fitness room',
      bio: 'Early-morning runner and yoga fan.',
      hobbies: ['running', 'yoga'], interests: ['fitness', 'wellness'],
      chat: {
        greeting: "Hi! 👋 Nice to meet you!",
        quickReplies: [
          { label: "Early runner? How early are we talking?", response: "5:45am, sunrise on the pathway. I know, I know. But it's so worth it ☀️" },
          { label: "Yoga to recover after runs?", response: "Exactly! A little evening stretch flow. Saved my hamstrings, honestly." },
          { label: "Any fitness goals right now?", response: "Working toward a half marathon and actually touching my toes. Both in progress 😅" },
        ],
        closer: "If you're an early bird, come run with me — coffee's on me after!",
      },
    },
    {
      p: 2, email: 'ethan.cloutier@example.ca', firstName: 'Ethan', lastName: 'Cloutier', unit: '205', img: 61, open: true, moveIn: '2025-03-18', spot: 'Bike storage',
      bio: 'Bike commuter and board-game host on Whyte Ave.',
      hobbies: ['cycling', 'board games', 'coffee'], interests: ['technology', 'community events'],
      chat: {
        greeting: "Hey! 👋 Welcome — you new to Whyte too?",
        quickReplies: [
          { label: "You bike commute — worth it?", response: "100%. Beats traffic, and the ride down 104th is gorgeous. Rain days test my commitment though 🚲" },
          { label: "Heard you host board game nights?", response: "Every couple weeks! Whyte's got great pubs but nothing beats a cozy game night in. You're invited." },
          { label: "Best coffee on Whyte?", response: "Little independent spot by the theatre — the barista knows my order. That's when you know." },
        ],
        closer: "Come to the next game night — the Whyte Ave crew's a good bunch!",
      },
    },
    {
      p: 2, email: 'isla.nadeau@example.ca', firstName: 'Isla', lastName: 'Nadeau', unit: '112', img: 41, open: true, moveIn: '2024-12-20', spot: 'Community garden',
      bio: 'Gardener, baker, and crafter. Always sharing extra sourdough.',
      hobbies: ['gardening', 'cooking', 'book club'], interests: ['sustainability', 'foodie', 'arts & crafts'],
      chat: {
        greeting: "Hi! 👋 Oh I love meeting new neighbours.",
        quickReplies: [
          { label: "Sourdough baker, I hear?", response: "My starter's named Doreen and she's high maintenance, but the bread's worth it 🍞 Want a loaf?" },
          { label: "What's growing in the garden?", response: "Kale, peas, and a heroic strawberry patch. Come help harvest and take some home!" },
          { label: "You craft too — what kind?", response: "Mostly knitting and a bit of watercolour. Cozy hobbies for long Edmonton winters." },
        ],
        closer: "Next time I bake, I'll save you a slice — neighbours who share bread stay friends 🍞",
      },
    },
    {
      p: 2, email: 'mason.levesque@example.ca', firstName: 'Mason', lastName: 'Levesque', unit: '408', img: 68, open: true, moveIn: '2025-01-08', spot: 'Rooftop deck',
      bio: 'Runner and gig-goer. Whyte Ave has the best live music.',
      hobbies: ['gaming', 'live music', 'running'], interests: ['local music scene', 'fitness'],
      chat: {
        greeting: "Yo! 👋 What's up, neighbour?",
        quickReplies: [
          { label: "Whyte's got the best live music, you said?", response: "For real. Blues on Whyte, tiny venues everywhere. I'm out most weekends — come along sometime 🎶" },
          { label: "What are you gaming?", response: "Rocket League when I've got 20 mins, RPGs when I've got 200 hours. No in-between 😂" },
          { label: "You run too — around the neighbourhood?", response: "River valley trails, best in the city. Long run then a show is my ideal Saturday." },
        ],
        closer: "Next good gig, I'll text you the details — always better with company!",
      },
    },
    {
      p: 2, email: 'aria.poirier@example.ca', firstName: 'Aria', lastName: 'Poirier', unit: '301', img: 47, open: true, moveIn: '2025-04-28', spot: 'Dog run',
      bio: 'Hiker with a rescue pup. Morning yoga on the rooftop.',
      hobbies: ['hiking', 'dogs', 'yoga'], interests: ['outdoors', 'pets', 'wellness'],
      chat: {
        greeting: "Hi! 👋 So nice to meet you!",
        quickReplies: [
          { label: "Tell me about your rescue pup!", response: "Her name's Willow, she's part husky, all attitude, and my best hiking partner 🐺" },
          { label: "Favourite hike with the dog?", response: "River valley for quick ones, Jasper when we've got a weekend. Willow lives for the car rides." },
          { label: "Rooftop yoga sounds amazing.", response: "Sunrise flow up top is unreal. Quiet, fresh air, city waking up. You should join!" },
        ],
        closer: "Morning hike or rooftop yoga — either way, Willow and I would love the company 🌄",
      },
    },
        // ---- extra residents for richer hobby/interest data ----
    {
      p: 0, email: 'ethan.walsh@example.ca', firstName: 'Ethan', lastName: 'Walsh', unit: '308', img: 3, open: true, moveIn: '2025-02-14', spot: 'Café corner',
      bio: 'Coffee snob and weekend hiker. Training for my first half-marathon.',
      hobbies: ['coffee', 'hiking', 'running', 'fitness'], interests: ['outdoors', 'wellness', 'fitness'],
      chat: { greeting: "Hey! 👋 New here — where's the good coffee at?", quickReplies: [ { label: "Favourite trail nearby?", response: "Prairie Mountain if I've got the legs for it. You hike?" }, { label: "Training for anything?", response: "Half-marathon in spring. Currently questioning every life choice 😅" }, { label: "Best coffee spot?", response: "Rosso, hands down. I'm there most mornings ☕" } ], closer: "Let's grab a coffee then maybe a trail run — my kind of weekend!" },
    },
    {
      p: 0, email: 'chloe.martin@example.ca', firstName: 'Chloe', lastName: 'Martin', unit: '415', img: 24, open: true, moveIn: '2025-04-08', spot: 'Yoga studio',
      bio: 'Yoga teacher, coffee lover, always cooking something new.',
      hobbies: ['yoga', 'coffee', 'cooking'], interests: ['wellness', 'foodie', 'community events'],
      chat: { greeting: "Hi! 👋 Lovely to meet a neighbour.", quickReplies: [ { label: "You teach yoga?", response: "I do! Thinking of a Sunday class in the lounge — you'd be welcome 🧘‍♀️" }, { label: "What are you cooking lately?", response: "Big into Korean food right now. Made kimchi jjigae last night!" }, { label: "Coffee order?", response: "Oat flat white, every single day. No notes ☕" } ], closer: "Come to yoga, stay for coffee — I'd love that!" },
    },
    {
      p: 0, email: 'noah.reid@example.ca', firstName: 'Noah', lastName: 'Reid', unit: '622', img: 52, open: true, moveIn: '2025-01-30', spot: 'Fitness room',
      bio: 'Gym rat and meal-prep enthusiast. Coffee before, protein after.',
      hobbies: ['fitness', 'cooking', 'coffee'], interests: ['fitness', 'foodie', 'wellness'],
      chat: { greeting: "Yo! 👋 What's good, neighbour?", quickReplies: [ { label: "Gym in the building any good?", response: "Solid setup! I'm there 6am most days if you want a spotter 💪" }, { label: "Meal prep tips?", response: "Cook once, eat five times. Sunday is chicken-and-rice day, always." }, { label: "Pre-workout coffee?", response: "Double espresso, no exceptions. Fuel ☕" } ], closer: "Hit me up for a gym session anytime — always better with a partner!" },
    },
    {
      p: 0, email: 'sophie.dubois@example.ca', firstName: 'Sophie', lastName: 'Dubois', unit: '210', img: 26, open: true, moveIn: '2024-10-22', spot: 'Community garden',
      bio: 'Gardener and baker. Hiking on weekends when the weather cooperates.',
      hobbies: ['gardening', 'hiking', 'cooking'], interests: ['sustainability', 'outdoors', 'foodie'],
      chat: { greeting: "Hi! 👋 So nice to meet you.", quickReplies: [ { label: "What's in the garden?", response: "Tomatoes and way too much mint. Come grab some 🌿" }, { label: "Weekend hikes?", response: "Love the Canmore trails. Slow pace, lots of photo stops!" }, { label: "You bake?", response: "Sourdough obsessive. My starter has a name. Don't judge 🍞" } ], closer: "Fresh veggies or fresh bread — you know where to find me!" },
    },
    {
      p: 0, email: 'marcus.lee@example.ca', firstName: 'Marcus', lastName: 'Lee', unit: '505', img: 54, open: true, moveIn: '2025-03-22', spot: 'Lobby lounge',
      bio: 'Photographer and live-music devotee. Always chasing good light and good gigs.',
      hobbies: ['photography', 'live music', 'coffee'], interests: ['arts & crafts', 'local music scene', 'foodie'],
      chat: { greeting: "Hey 👋 Good to meet you!", quickReplies: [ { label: "What do you shoot?", response: "Street and film photography mostly. This city has great light 📷" }, { label: "Catch good shows?", response: "Every weekend if I can. I keep a gig list — want in?" }, { label: "Coffee person?", response: "The ritual matters as much as the caffeine ☕" } ], closer: "Next gig or golden-hour walk, I'll give you a shout!" },
    },
    {
      p: 1, email: 'ava.thompson@example.ca', firstName: 'Ava', lastName: 'Thompson', unit: '304', img: 27, open: true, moveIn: '2025-02-05', spot: 'Reading nook',
      bio: 'Runner and coffee addict. Weekend hikes are my therapy.',
      hobbies: ['running', 'coffee', 'hiking', 'fitness'], interests: ['fitness', 'outdoors', 'wellness'],
      chat: { greeting: "Hi neighbour! 👋", quickReplies: [ { label: "Where do you run?", response: "River pathway loop, rain or shine. Want a buddy?" }, { label: "Coffee after?", response: "Always. Earned it, right? ☕" }, { label: "Favourite hike?", response: "Ha Ling if I'm feeling brave. The view is unreal." } ], closer: "Run, hike, coffee — pick any and I'm in!" },
    },
    {
      p: 1, email: 'james.carter@example.ca', firstName: 'James', lastName: 'Carter', unit: '511', img: 55, open: true, moveIn: '2024-12-11', spot: 'Games lounge',
      bio: 'Board-gamer and home cook. Coffee keeps the game nights going.',
      hobbies: ['board games', 'cooking', 'coffee'], interests: ['community events', 'foodie', 'technology'],
      chat: { greeting: "Hey! 👋 You into games?", quickReplies: [ { label: "What do you play?", response: "Heavy euro games. Terraforming Mars is my jam 🚀" }, { label: "You cook too?", response: "Game-night snacks are my specialty. Nachos incoming." }, { label: "Coffee for late nights?", response: "How else do you survive a 3-hour board game? ☕" } ], closer: "Come to the next game night — bring your appetite!" },
    },
    {
      p: 1, email: 'mia.robinson@example.ca', firstName: 'Mia', lastName: 'Robinson', unit: '208', img: 28, open: true, moveIn: '2025-04-18', spot: 'Yoga corner',
      bio: 'Yoga and gardening keep me sane. Coffee keeps me moving.',
      hobbies: ['yoga', 'gardening', 'coffee'], interests: ['wellness', 'sustainability', 'community events'],
      chat: { greeting: "Hi! 👋 Great to meet you.", quickReplies: [ { label: "Yoga in the building?", response: "I do a quiet morning flow — join anytime 🧘‍♀️" }, { label: "You garden?", response: "Balcony herbs and a stubborn tomato plant. Progress!" }, { label: "Coffee order?", response: "Cortado. Small but mighty ☕" } ], closer: "Morning yoga then coffee — the dream, honestly!" },
    },
    {
      p: 1, email: 'lucas.brown@example.ca', firstName: 'Lucas', lastName: 'Brown', unit: '619', img: 56, open: true, moveIn: '2025-01-09', spot: 'Fitness room',
      bio: 'Cyclist and gym-goer. Cooking big batches to fuel the miles.',
      hobbies: ['cycling', 'fitness', 'cooking'], interests: ['fitness', 'outdoors', 'foodie'],
      chat: { greeting: "Hey! 👋 What's up?", quickReplies: [ { label: "You cycle a lot?", response: "Weekends I'm out on the pathways for hours. Come ride!" }, { label: "Gym regular?", response: "Every other day. Legs day is a lifestyle unfortunately 😅" }, { label: "Meal prep?", response: "Big batches Sundays. Carbs are a cyclist's best friend." } ], closer: "Ride or gym, either way let's move sometime!" },
    },
    {
      p: 1, email: 'grace.wilson@example.ca', firstName: 'Grace', lastName: 'Wilson', unit: '412', img: 30, open: true, moveIn: '2024-11-28', spot: 'Café corner',
      bio: 'Coffee, books, and the occasional pottery class.',
      hobbies: ['coffee', 'book club', 'pottery'], interests: ['arts & crafts', 'wellness', 'community events'],
      chat: { greeting: "Hi! 👋 Nice to meet a neighbour.", quickReplies: [ { label: "Book club here?", response: "Trying to start one! First pick's a cozy mystery 📚" }, { label: "You do pottery?", response: "Weekly class — my mugs are lopsided but loved 🏺" }, { label: "Coffee spot?", response: "The corner café is my second home ☕" } ], closer: "Books, clay, or coffee — come hang!" },
    },
    {
      p: 2, email: 'oliver.scott@example.ca', firstName: 'Oliver', lastName: 'Scott', unit: '207', img: 62, open: true, moveIn: '2025-03-05', spot: 'Bike storage',
      bio: 'Cyclist, coffee fiend, live-music regular on Whyte.',
      hobbies: ['cycling', 'coffee', 'live music'], interests: ['local music scene', 'outdoors', 'foodie'],
      chat: { greeting: "Hey! 👋 New to Whyte?", quickReplies: [ { label: "You cycle?", response: "Commute by bike year-round. Yes, even winter. Send help ❄️🚲" }, { label: "Good coffee nearby?", response: "The spot by the theatre knows my order. That's love ☕" }, { label: "Live music?", response: "Whyte's the best for it — I'm out most weekends 🎶" } ], closer: "Ride, coffee, or a show — Whyte's got it all, come along!" },
    },
    {
      p: 2, email: 'ella.young@example.ca', firstName: 'Ella', lastName: 'Young', unit: '410', img: 31, open: true, moveIn: '2025-02-19', spot: 'Rooftop deck',
      bio: 'Hiker and home cook. Astronomy nerd on clear nights.',
      hobbies: ['hiking', 'cooking', 'astronomy'], interests: ['outdoors', 'foodie', 'wellness'],
      chat: { greeting: "Hi! 👋 So nice to meet you.", quickReplies: [ { label: "Favourite hike?", response: "River valley trails, endless and gorgeous. You?" }, { label: "What do you cook?", response: "Comfort food, always. Big pots of soup in winter 🍲" }, { label: "Astronomy?", response: "Rooftop with a telescope on clear nights. Saturn's rings are unreal 🔭" } ], closer: "Hike by day, stargaze by night — join me sometime 🌌" },
    },
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
      chatScript: r.chat,
    })
    profiles.push({
      _id: new ObjectId(), userId: _id, bio: r.bio, hobbies: r.hobbies, interests: r.interests,
      photoUrl: `https://i.pravatar.cc/400?img=${r.img}`, moveInDate: dateOf(r.moveIn), favoriteSpotInBuilding: r.spot,
    })
  }

  // ---- property management hierarchy: RPMs + APMs ----
  const rpmDefs = [
    { email: 'demo.rpm@residenthub.ca', firstName: 'Priya', lastName: 'Sharma', img: 31 },
    { email: 'marcus.leblanc@residenthub.ca', firstName: 'Marcus', lastName: 'Leblanc', img: 52 },
  ]
  const rpmIds = []
  for (const r of rpmDefs) {
    const _id = new ObjectId(); rpmIds.push(_id)
    users.push({ _id, propertyId: null, email: r.email, passwordHash: 'demo', firstName: r.firstName, lastName: r.lastName, unitNumber: 'Regional office', isOpenToMeeting: false, role: 'RPM', managedByRpmId: null, createdAt: daysAgo(220), chatScript: null })
    profiles.push({ _id: new ObjectId(), userId: _id, bio: 'Regional Property Manager', hobbies: [], interests: [], photoUrl: `https://i.pravatar.cc/400?img=${r.img}`, moveInDate: daysAgo(220), favoriteSpotInBuilding: 'Regional office' })
  }

  // APMs: 2 per property, 3 per RPM. target = desired overall average.
  const apmDefs = [
    { email: 'demo.apm@residenthub.ca',      firstName: 'Sarah',  lastName: 'Mitchell', img: 48, p: 0, rpm: 0, target: 4.6 },
    { email: 'david.chen@residenthub.ca',    firstName: 'David',  lastName: 'Chen',     img: 59, p: 0, rpm: 1, target: 4.4 },
    { email: 'rachel.nguyen@residenthub.ca', firstName: 'Rachel', lastName: 'Nguyen',   img: 45, p: 1, rpm: 0, target: 3.2 },
    { email: 'tyler.brooks@residenthub.ca',  firstName: 'Tyler',  lastName: 'Brooks',   img: 12, p: 1, rpm: 1, target: 4.3 },
    { email: 'megan.oconnor@residenthub.ca', firstName: 'Megan',  lastName: "O'Connor", img: 24, p: 2, rpm: 0, target: 3.3 },
    { email: 'aisha.patel@residenthub.ca',   firstName: 'Aisha',  lastName: 'Patel',    img: 27, p: 2, rpm: 1, target: 4.8 },
  ]
  const apmMeta = []
  for (const a of apmDefs) {
    const _id = new ObjectId(); apmMeta.push({ id: _id, p: a.p, target: a.target })
    users.push({ _id, propertyId: P[a.p], email: a.email, passwordHash: 'demo', firstName: a.firstName, lastName: a.lastName, unitNumber: 'Leasing office', isOpenToMeeting: false, role: 'APM', managedByRpmId: rpmIds[a.rpm], createdAt: daysAgo(210), chatScript: null })
    profiles.push({ _id: new ObjectId(), userId: _id, bio: 'Assistant Property Manager', hobbies: [], interests: [], photoUrl: `https://i.pravatar.cc/400?img=${a.img}`, moveInDate: daysAgo(210), favoriteSpotInBuilding: 'Leasing office' })
  }

  // Keep existing event/report references working: one APM id per property index.
  const sid = [
    apmMeta.find(m => m.p === 0).id,
    apmMeta.find(m => m.p === 1).id,
    apmMeta.find(m => m.p === 2).id,
  ]

  await db.collection('users').insertMany(users)
  await db.collection('userProfiles').insertMany(profiles)

  // ---- viewing feedback (mock prospective-tenant ratings) ----
  const prospectNames = ['Jordan Blackwood', 'Chloe Fontaine', 'Aiden Wong', 'Maya Desjardins', 'Ethan Reid', 'Priya Kaur', 'Liam Fraser', 'Sofia Marchetti', 'Nathan Boucher', 'Grace Kim', 'Owen Sinclair', 'Hannah Leblanc', 'Dylan Chretien', 'Zoe Armstrong', 'Cole Tremblay', 'Ruby Nakamura', 'Aaron Gill', 'Layla Haddad', 'Spencer Reid', 'Nora Bergeron']
  const goodComments = ['So warm and welcoming — felt like home right away.', 'Answered every question about the building. Super knowledgeable.', 'Professional and friendly, made the tour easy.', 'Great communicator, followed up the same day.', 'Really lovely experience, no pressure at all.', 'Knew the neighbourhood inside out. Impressed!']
  const midComments = ['Nice enough, but felt a little rushed.', 'Friendly, though I had to follow up a couple times.', 'Good tour overall, a few questions went unanswered.', 'Pleasant, but communication could be tighter.']
  const lowComments = ['Felt rushed and hard to reach afterwards.', 'Seemed unprepared for my questions.', 'Communication was slow — took days to reply.', 'Polite but not very informative about the suite.']
  const clamp5 = (n) => Math.max(1, Math.min(5, n))
  const genScore = (t) => clamp5(Math.round(t + (Math.random() * 1.4 - 0.7)))
  const feedbackDocs = []
  apmMeta.forEach((m) => {
    for (let i = 0; i < 12; i++) {
      const scores = {
        friendliness: genScore(m.target + 0.2),
        professionalism: genScore(m.target),
        knowledge: genScore(m.target - 0.1),
        communication: genScore(m.target - (m.target < 3.5 ? 0.4 : 0)),
        overallExperience: genScore(m.target),
      }
      const avg = (scores.friendliness + scores.professionalism + scores.knowledge + scores.communication + scores.overallExperience) / 5
      const pool = avg >= 4 ? goodComments : avg >= 3.4 ? midComments : lowComments
      feedbackDocs.push({
        _id: new ObjectId(), apmId: m.id, propertyId: P[m.p],
        prospectName: prospectNames[(i + m.p * 3) % prospectNames.length],
        scores, comment: pool[Math.floor(Math.random() * pool.length)],
        createdAt: daysAgo(Math.floor(Math.random() * 90)),
      })
    }
  })
  await db.collection('viewingFeedback').insertMany(feedbackDocs)

  // ---- connections ----
  const accepted = [
    [0, 1], [0, 2], [0, 5], [1, 6], [2, 3], [4, 5], // p1
    [8, 9],                                          // p2 (Jack-Mia)
    [14, 15],                                        // p3 (Ethan-Isla)
  ]
  const pending = [
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
  const scripts = [
    ['Hey Liam! Saw you host game nights — mind if I join the next one?', 'Absolutely, the more the merrier! Fridays at 7 in the lounge.', 'Perfect, I make a mean guacamole 🥑', 'Now you HAVE to come.', 'Haha deal. See you Friday!', 'Bringing Catan and Codenames.', 'Love both. Can invite a couple others?', 'Please do!'],
    ['Olivia! Is that Biscuit in the elevator? So cute!', "That's him! He's a menace but we love him.", 'I run mornings too — want a running buddy?', 'Yes! 6:30am by the river?', "You're on. Coffee after?", 'Non-negotiable ☕', 'See you tomorrow!'],
    ['Sophia, you mentioned a great espresso spot?', 'Monogram on 8th — best flat white in the city.', 'Adding to my list. Up for a weekend hike sometime?', 'Always! Grotto Canyon is gorgeous right now.', "Let's plan for Saturday.", "Done. I'll bring trail snacks."],
    ['Welcome to the building William!', 'Thanks Liam! Still unpacking boxes.', 'Vinyl collector eh? We should compare records.', "For sure — I've got a stack of jazz.", 'Come by game night too.', 'you keep messaging me about this, kind of a lot', "Oh, sorry — didn't mean to overdo it."],
  ]
  const convos = [
    { key: '0-1', a: 0, b: 1 }, // Emma & Liam
    { key: '0-2', a: 0, b: 2 }, // Emma & Olivia
    { key: '0-5', a: 0, b: 5 }, // Emma & Sophia
    { key: '1-6', a: 1, b: 6 }, // Liam & William
  ]
  const msgDocs = []
  const capture = { williamMsgId: null }
  convos.forEach((c, ci) => {
    const connId = connByKey[c.key]
    const senders = [rid[c.a], rid[c.b]]
    scripts[ci].forEach((content, mi) => {
      const _id = new ObjectId()
      const senderId = senders[mi % 2]
      if (c.key === '1-6' && mi === 5) capture.williamMsgId = _id
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
      _id: new ObjectId(), reporterId: rid[1], reportedUserId: rid[6], connectionId: connByKey['1-6'], messageId: capture.williamMsgId,
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
  await db.collection('users').createIndex({ managedByRpmId: 1 })
  await db.collection('viewingFeedback').createIndex({ apmId: 1, createdAt: -1 })

  console.log(`Seeded management: ${rpmDefs.length} RPMs, ${apmDefs.length} APMs, ${feedbackDocs.length} viewing feedback entries.`)

  console.log(`Seeded: ${props.length} properties, ${users.length} users (${R.length} residents + ${rpmDefs.length} RPMs + ${apmDefs.length} APMs), ${connDocs.length} connections, ${msgDocs.length} messages, ${reports.length} reports, ${events.length} events. chatScript added to all ${R.length} residents.`)
  await client.close()
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
