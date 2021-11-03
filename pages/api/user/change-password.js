import { getSession } from 'next-auth/client';
import { verifyPassword, hashPassword } from '../../../lib/auth';
import { connectDatabase } from '../../../lib/db';

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return;
  }

  const session = await getSession({ req: req });
  console.log(session);
  if (!session) {
    res.status(401).json({ message: 'Not authenticated!' });
    return;
  }

  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const userEmail = session.user.email;

  const client = await connectDatabase();
  const userCollction = client.db().collection('users');
  const user = await userCollction.findOne({ email: userEmail });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    client.close();
    return;
  }
  const isPasswordOk = await verifyPassword(oldPassword, user.password);

  if (!isPasswordOk) {
    res.status(403).json({ message: 'Wrong old password!' });
    client.close();
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  const result = await userCollction.updateOne(
    { email: userEmail },
    { $set: { password: hashedPassword } }
  );

  res.status(200).json({ message: 'User password update!' });
  client.close();
}

export default handler;
