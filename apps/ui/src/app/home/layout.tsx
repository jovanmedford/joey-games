import { SocketProvider } from '../socket-context';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
