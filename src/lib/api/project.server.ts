
import { cookies } from 'next/headers';
import { verstappenClient } from '../config/clients';


export async function getProjectByIdServer(projectId: string) {
  const cookieStore =  cookies();
  const token = (await cookieStore).get('accessToken')?.value;

  console.log('token eba:', token);

  if (!token) return null;

  const res = await verstappenClient.get(`/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

