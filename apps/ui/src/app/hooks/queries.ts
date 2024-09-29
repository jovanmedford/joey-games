'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JoeyGamesError, UserDto } from '@joey-games/lib';
import { Invitation } from '@prisma/client';
import { useSocket } from '../socket-context';

export function useLogin() {
  const router = useRouter();
  const socket = useSocket();
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      socket.connect();
      router.push('/home');
    },
  });
}

export function useStatus() {
  return useQuery<UserDto>({
    queryKey: ['user'],
    queryFn: getStatus,
  });
}

export function usePendingInvitations() {
  return useQuery<Invitation[]>({
    queryKey: ['pendingInvitations'],
    queryFn: fetchPendingInvitations,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/');
    },
  });
}

async function fetchPendingInvitations() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ORIGIN}/api/invitation/pending`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new JoeyGamesError(error.message, response.status);
    }
    return response.json();
  } catch (e: any) {
    throw new JoeyGamesError(e.message);
  }
}

async function login({ email, password }: { email: string; password: string }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ORIGIN}/api/auth/login`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${email}&password=${password}`,
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new JoeyGamesError(error.message, response.status);
  }
  return response.json();
}

async function getStatus() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ORIGIN}/api/auth/status`,
    {
      credentials: 'include',
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new JoeyGamesError(error.message, response.status);
  }
  return response.json();
}

async function logout() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ORIGIN}/api/auth/logout`,
    {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new JoeyGamesError(error.message, response.status);
  }
}
