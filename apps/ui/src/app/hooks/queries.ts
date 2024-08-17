'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { QueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { UserDto } from '@joey-games/lib';

const queryClient = new QueryClient();

export function useLogin() {
  const router = useRouter();
  const toast = useToast();
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      router.push('/home');
    },
    onError: (data) => {
      toast({
        title: 'Login Failed.',
        description: data.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    },
  });
}

export function useStatus() {
  return useQuery<UserDto>({
    queryKey: ['user'],
    queryFn: getStatus,
  });
}

export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/');
    },
  });
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
    throw new Error(error.message);
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
    throw new Error(error.message);
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
    throw new Error(error.message);
  }
}
