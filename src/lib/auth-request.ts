import { firebaseAuth } from './firebase-client';

export const getAuthHeaders = async () => {
  const user = firebaseAuth?.currentUser;
  if (!user) {
    throw new Error('You must be signed in to continue.');
  }

  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};
