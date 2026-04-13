import { connectDatabase } from "../config/db";
import { User } from "../models/user.model";
import { hashPassword } from "../utils/password";

const seed = async (): Promise<void> => {
  await connectDatabase();

  const password = await hashPassword("password123");

  const users = [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      password
    },
    {
      name: "Bob Smith",
      email: "bob@example.com",
      password
    },
    {
      name: "Charlie Brown",
      email: "charlie@example.com",
      password
    }
  ];

  for (const user of users) {
    await User.updateOne({ email: user.email }, { $setOnInsert: user }, { upsert: true });
  }

  // eslint-disable-next-line no-console
  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed", error);
  process.exit(1);
});
