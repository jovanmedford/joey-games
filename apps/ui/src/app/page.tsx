'use client';
import { useState } from 'react';
import { Button, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = (e: any) => setEmail(e.target.value);
  const handlePasswordChange = (e: any) => setPassword(e.target.value);

  const handleSubmit = async () => {
    try {
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
        throw new Error();
      }
      let user = await response.json();
      console.log(user);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="flex flex-col justify-center h-screen">
      <h1 className="text-center max-w-lg  mx-auto mb-12">Joey Games</h1>
      <section className="flex justify-center">
        <form className="w-80 block mb-20">
          <FormControl className="mb-4">
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={handleEmailChange} />
          </FormControl>
          <FormControl className="mb-8">
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </FormControl>
          <Stack>
            <Button onClick={handleSubmit} className="mb-1">
              Log in
            </Button>
            <Button variant="outline">Sign up</Button>
          </Stack>
        </form>
      </section>
    </div>
  );
}
