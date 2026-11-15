const pool = require("./pool");

async function getUserByUsername(email) {
  const { rows } = await pool.query(`
    SELECT *
      FROM users
    WHERE email = $1;
    `, [email]);

    return rows[0];
}

async function getUserById(id) {
  const { rows } = await pool.query(`
    SELECT *
      FROM users
    WHERE id = $1;
    `, [id]);

    return rows[0];
}

async function getAllMessages() {
  const { rows } = await pool.query(`
    SELECT
      messages.id,
      messages.title,
      messages.story,
      messages.created_at,
      users.first_name,
      users.last_name
    FROM messages
    JOIN users ON users.id = messages.user_id
    ORDER BY messages.created_at DESC;
  `);

  return rows;
}

async function insertNewUser(firstName, lastName, email, passwordHash) {
  const { rows } = await pool.query(
    `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, first_name, last_name, email, is_member, is_admin;
    `,
    [firstName, lastName, email, passwordHash]
  );

  return rows[0];
}

async function insertNewMessage(title, story, userId) {
  const { rows } = await pool.query(
    `
      INSERT INTO messages (title, story, user_id)
      VALUES ($1, $2, $3)
      RETURNING id, title, story, created_at, user_id;
    `,
    [title, story, userId]
  );

  return rows[0];
}

async function makeUserMember(userId) {
  const { rows } = await pool.query(
    `
      UPDATE users
      SET is_member = TRUE
      WHERE id = $1
      RETURNING id, first_name, last_name, email, is_member, is_admin;
    `,
    [userId]
  );

  return rows[0];
}

async function deleteMessageFromDB(messageId) {
  const { rows } = await pool.query(
    `DELETE FROM messages WHERE id = $1 RETURNING id;`,
    [messageId]
  );
  return rows[0];
}

module.exports = {
    getUserByUsername,
    getUserById,
    getAllMessages,
    insertNewUser,
    insertNewMessage,
    makeUserMember,
    deleteMessageFromDB
};
