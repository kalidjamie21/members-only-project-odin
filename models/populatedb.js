require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("./pool");

const users = [
  {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    password: "password123",
    isMember: true,
    isAdmin: true,
  },
  {
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
    password: "password123",
    isMember: true,
    isAdmin: false,
  },
  {
    firstName: "Alan",
    lastName: "Turing",
    email: "alan@example.com",
    password: "password123",
    isMember: false,
    isAdmin: false,
  },
];

const messages = [
  {
    email: "ada@example.com",
    title: "Welcome to the clubhouse",
    story: "The best ideas are often improved through collaboration.",
  },
  {
    email: "grace@example.com",
    title: "A lesson from debugging",
    story: "A careful investigation usually reveals that the problem is smaller than it first appeared.",
  },
  {
    email: "alan@example.com",
    title: "An outsider's thought",
    story: "Every good community benefits from curious questions.",
  },
];

async function populateDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userIds = new Map();

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const result = await client.query(
        `
          INSERT INTO users
            (first_name, last_name, email, password_hash, is_member, is_admin)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (email) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            password_hash = EXCLUDED.password_hash,
            is_member = EXCLUDED.is_member,
            is_admin = EXCLUDED.is_admin
          RETURNING id
        `,
        [
          user.firstName,
          user.lastName,
          user.email,
          passwordHash,
          user.isMember,
          user.isAdmin,
        ],
      );

      userIds.set(user.email, result.rows[0].id);
    }

    for (const message of messages) {
      await client.query(
        `
          INSERT INTO messages (title, story, user_id)
          VALUES ($1, $2, $3)
        `,
        [message.title, message.story, userIds.get(message.email)],
      );
    }

    await client.query("COMMIT");
    console.log("Users and messages populated successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database population failed:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

populateDatabase();
